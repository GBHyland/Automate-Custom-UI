/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { User, InitialUsernamePipe, AppConfigService } from '@alfresco/adf-core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { switchMap, mergeMap, debounceTime, distinctUntilChanged, filter, tap, map } from 'rxjs/operators';
import { IdentityUserModel } from '../models/identity-user.model';
import { SharedIdentityFullNamePipe } from '../pipe/full-name.pipe';
import { SHARED_IDENTITY_USER_SERVICE_TOKEN } from '../services/identity-user-service.token';
import { SHARED_IDENTITY_FULL_NAME_PIPE_INCLUDE_EMAIL } from '../pipe/full-name-email-required.token';
import { UserSearchType } from '../models/user-search-type.enum';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'identity-people',
    templateUrl: './people.smart-component.html',
    styleUrls: ['./people.smart-component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('transitionMessages', [
            state('enter', style({ opacity: 1, transform: 'translateY(0%)' })),
            transition('void => enter', [style({ opacity: 0, transform: 'translateY(-100%)' }), animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)')]),
        ]),
    ],
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatChipsModule,
        MatIconModule,
        MatTooltipModule,
        MatAutocompleteModule,
        MatOptionModule,
        AsyncPipe,
        SharedIdentityFullNamePipe,
        TranslatePipe,
        InitialUsernamePipe,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatProgressBarModule,
    ],
})
export class PeopleSmartComponent implements OnInit, OnChanges {
    /** Name of the application. If specified, this shows the users who have access to the app. */
    @Input()
    appName!: string;

    /** User selection mode (single/multiple). */
    @Input()
    mode: 'single' | 'multiple' = 'single';

    /** Role names of the users to be listed. */
    @Input()
    roles!: string[];

    /** This flag enables the validation on the preSelectUsers passed as input.
     * In case the flag is true the components call the identity service to verify the validity of the information passed as input.
     * Otherwise, no check will be done.
     */
    @Input()
    validate = false;

    /** Show the info in readonly mode
     */
    @Input()
    readOnly = false;

    /** Mark this field as required
     */
    @Input()
    required = false;

    /** Array of users to be pre-selected. All users in the
     * array are pre-selected in multi selection mode, but only the first user
     * is pre-selected in single selection mode.
     * Mandatory properties are: id, email, username
     */
    @Input()
    preSelectUsers: IdentityUserModel[] = [];

    /** Array of users to be excluded.
     * Mandatory properties are: id, email, username
     */
    @Input()
    excludedUsers: IdentityUserModel[] = [];

    /** Array of groups to restrict user searches.
     * Mandatory property is group name
     */
    @Input()
    groupsRestriction: string[] = [];

    /** FormControl to list of users */
    @Input()
    userChipsCtrl: UntypedFormControl = new UntypedFormControl({
        value: '',
        disabled: false,
    });

    /** FormControl to search the user */
    @Input()
    searchUserCtrl = new UntypedFormControl({ value: '', disabled: false });

    /** Placeholder translation key */
    @Input()
    title!: string;

    /** User type that should be returned in the search result */
    @Input()
    type: UserSearchType = UserSearchType.INTERACTIVE;

    @Input()
    inputTooltip = '';

    /** Emitted when a user is selected. */
    @Output()
    selectUser = new EventEmitter<IdentityUserModel>();

    /** Emitted when a selected user is removed in multi selection mode. */
    @Output()
    removeUser = new EventEmitter<IdentityUserModel>();

    /** Emitted when a user selection change. */
    @Output()
    changedUsers = new EventEmitter<IdentityUserModel[]>();

    /** Emitted when an warning occurs. */
    @Output()
    warning = new EventEmitter<any>();

    @ViewChild('userInput')
    private userInput!: ElementRef<HTMLInputElement>;

    private searchUsers: IdentityUserModel[] = [];
    private readonly destroyRef = inject(DestroyRef);

    selectedUsers: IdentityUserModel[] = [];
    invalidUsers: IdentityUserModel[] = [];

    searchUsers$ = new BehaviorSubject<IdentityUserModel[]>(this.searchUsers);
    subscriptAnimationState = 'enter';
    isFocused!: boolean;
    touched = false;

    validateUsersMessage!: string;
    searchedValue = '';

    validationLoading = false;
    searchLoading = false;

    typingUniqueValueNotEmpty$!: Observable<string>;

    public readonly includeEmail = inject(SHARED_IDENTITY_FULL_NAME_PIPE_INCLUDE_EMAIL, { optional: true }) ?? false;
    private readonly identityUserService = inject(SHARED_IDENTITY_USER_SERVICE_TOKEN);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly appConfigService = inject(AppConfigService);

    get isHxpAdminApp(): boolean {
        return this.appConfigService.get('application.key') === 'hxps-admin';
    }

    ngOnInit(): void {
        this.initSearch();
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (this.hasPreselectedUsersChanged(changes) || this.hasModeChanged(changes) || this.isValidationChanged(changes)) {
            if (this.hasPreSelectUsers()) {
                await this.loadPreSelectUsers();
            } else if (this.hasPreselectedUsersCleared(changes)) {
                this.selectedUsers = [];
                this.invalidUsers = [];
            }

            if (!this.validate) {
                this.invalidUsers = [];
            }
        }

        if (this.isReadonly()) {
            this.searchUserCtrl.disable();
        } else {
            this.searchUserCtrl.enable();
        }
    }

    private initSearch(): void {
        this.initializeStream();
        this.typingUniqueValueNotEmpty$
            .pipe(
                switchMap((name: string) =>
                    this.identityUserService.search(name, {
                        roles: this.roles,
                        withinApplication: this.appName,
                        groups: this.groupsRestriction,
                        type: this.type,
                    })
                ),
                mergeMap((users: IdentityUserModel[]) => {
                    this.resetSearchUsers();
                    this.searchLoading = false;
                    return users;
                }),
                filter((user) => !this.isUserAlreadySelected(user) && !this.isExcludedUser(user)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((user) => {
                this.searchUsers.push(user);
                this.searchUsers$.next(this.searchUsers);
            });
    }

    private initializeStream() {
        const typingValueTypeSting$ = this.searchUserCtrl.valueChanges.pipe(
            filter((value) => {
                this.searchLoading = true;
                return typeof value === 'string';
            })
        );

        const typingValueHandleErrorMessage$ = typingValueTypeSting$.pipe(
            tap((value: string) => {
                if (value) {
                    this.setTypingError();
                }
            })
        );

        const typingValueDebouncedUnique$ = typingValueHandleErrorMessage$.pipe(distinctUntilChanged(), debounceTime(200));

        this.typingUniqueValueNotEmpty$ = typingValueDebouncedUnique$.pipe(
            map((value: string) => {
                this.searchedValue = value.trim();

                if (!this.searchedValue) {
                    this.searchUserCtrl.markAsPristine();
                    this.searchUserCtrl.markAsUntouched();
                }

                return this.searchedValue;
            }),
            tap(() => this.resetSearchUsers()),
            filter(() => !!this.searchedValue)
        );
    }

    private isUserAlreadySelected(searchUser: IdentityUserModel): boolean {
        if (this.selectedUsers && this.selectedUsers.length > 0) {
            const result = this.selectedUsers.find((selectedUser) => this.equalsUsers(selectedUser, searchUser));

            return !!result;
        }
        return false;
    }

    private isExcludedUser(searchUser: IdentityUserModel): boolean {
        if (this.excludedUsers?.length > 0) {
            return !!this.excludedUsers.find((excludedUser) => this.equalsUsers(excludedUser, searchUser));
        }
        return false;
    }

    private async loadPreSelectUsers(): Promise<void> {
        if (this.validate) {
            this.validationLoading = true;
            this.cdr.detectChanges();
            await this.validatePreselectUsers();
            this.validationLoading = false;
        }

        this.selectedUsers = [...this.getPreselectedUsers()];

        this.userChipsCtrl.setValue(this.selectedUsers[0].username);

        this.cdr.detectChanges();
    }

    private getPreselectedUsers(): IdentityUserModel[] {
        if (this.isSingleMode()) {
            return [this.preSelectUsers[0]];
        } else {
            return this.removeDuplicatedUsers(this.preSelectUsers);
        }
    }

    private fetchPreselectUsers(preselectedUser: any): Promise<any> {
        return firstValueFrom(
            this.identityUserService.search(preselectedUser.username, {
                roles: this.roles,
                withinApplication: this.appName,
                groups: this.groupsRestriction,
                type: this.type,
            })
        );
    }

    private async validatePreselectUsers(): Promise<any> {
        this.invalidUsers = [];

        for (const preselectedUser of this.getPreselectedUsers()) {
            if (preselectedUser) {
                try {
                    const searchResult = await this.fetchPreselectUsers(preselectedUser);
                    const validationResult = searchResult.filter((user: any) => user && user.username === preselectedUser.username)[0];

                    if (!this.equalsUsers(preselectedUser, validationResult)) {
                        this.invalidUsers.push(preselectedUser);
                    } else {
                        preselectedUser.id = validationResult.id;
                        preselectedUser.email = validationResult.email;
                        preselectedUser.firstName = validationResult.firstName;
                        preselectedUser.lastName = validationResult.lastName;
                    }
                } catch {
                    this.invalidUsers.push(preselectedUser);
                }
            }
        }

        this.checkPreselectValidationErrors();
    }

    equalsUsers(preselectedUser: IdentityUserModel, identityUser: IdentityUserModel): boolean {
        let isEqual = false;
        if (preselectedUser && identityUser) {
            if (preselectedUser.id !== undefined) {
                isEqual = isEqual || preselectedUser.id === identityUser.id;
            }
            if (preselectedUser.username !== undefined) {
                isEqual = isEqual || preselectedUser.username === identityUser.username;
            }
            if (preselectedUser.email !== undefined) {
                isEqual = isEqual || preselectedUser.email === identityUser.email;
            }
        }
        return isEqual;
    }

    removeDuplicatedUsers(users: IdentityUserModel[]): IdentityUserModel[] {
        return users.filter(
            (user, index, self) =>
                index === self.findIndex((auxUser) => user.id === auxUser.id && user.username === auxUser.username && user.email === auxUser.email)
        );
    }

    onSelect(user: IdentityUserModel): void {
        if (user) {
            this.selectUser.emit(user);

            if (this.isMultipleMode()) {
                if (!this.isUserAlreadySelected(user)) {
                    this.selectedUsers.push(user);
                }
            } else {
                this.invalidUsers = [];
                this.selectedUsers = [user];
            }

            this.userInput.nativeElement.value = '';
            this.searchUserCtrl.setValue('');
            this.userChipsControlValue(this.selectedUsers[0].username);

            this.changedUsers.emit(this.selectedUsers);
            this.resetSearchUsers();
        }
    }

    onRemove(userToRemove: IdentityUserModel): void {
        this.removeUser.emit(userToRemove);
        this.removeUserFromSelected(userToRemove);
        this.changedUsers.emit(this.selectedUsers);
        if (this.selectedUsers.length === 0) {
            this.userChipsControlValue('');
        } else {
            this.userChipsControlValue(this.selectedUsers[0].username);
        }
        this.searchUserCtrl.markAsDirty();
        this.searchUserCtrl.markAsTouched();

        if (this.validate) {
            this.removeUserFromValidation(userToRemove);
            this.checkPreselectValidationErrors();
        }
    }

    private checkPreselectValidationErrors(): void {
        this.invalidUsers = this.removeDuplicatedUsers(this.invalidUsers);

        if (this.invalidUsers.length > 0) {
            this.generateInvalidUsersMessage();
        }

        this.warning.emit({
            message: 'INVALID_PRESELECTED_USERS',
            users: this.invalidUsers,
        });
    }

    private removeUserFromSelected({ id, username, email }: IdentityUserModel): void {
        const indexToRemove = this.selectedUsers.findIndex((user) => user.id === id && user.username === username && user.email === email);

        if (indexToRemove !== -1) {
            this.selectedUsers.splice(indexToRemove, 1);
        }
    }

    private removeUserFromValidation({ id, username, email }: IdentityUserModel): void {
        const indexToRemove = this.invalidUsers.findIndex((user) => user.id === id && user.username === username && user.email === email);

        if (indexToRemove !== -1) {
            this.invalidUsers.splice(indexToRemove, 1);
        }
    }

    private generateInvalidUsersMessage(): void {
        this.validateUsersMessage = '';

        this.invalidUsers.forEach((invalidUser, index) => {
            if (index === this.invalidUsers.length - 1) {
                this.validateUsersMessage += `${invalidUser.username} `;
            } else {
                this.validateUsersMessage += `${invalidUser.username}, `;
            }
        });
    }

    hasPreselectError(): boolean {
        return this.invalidUsers && this.invalidUsers.length > 0;
    }

    getDisplayName(user: User): string {
        return SharedIdentityFullNamePipe.prototype.transform(user);
    }

    private isMultipleMode(): boolean {
        return this.mode === 'multiple';
    }

    private isSingleMode(): boolean {
        return this.mode === 'single';
    }

    private isSingleSelectionReadonly(): boolean {
        return this.isSingleMode() && this.selectedUsers.length === 1 && this.selectedUsers[0].readonly === true;
    }

    private hasPreSelectUsers(): boolean {
        return this.preSelectUsers && this.preSelectUsers.length > 0;
    }

    private hasModeChanged(changes: SimpleChanges): boolean {
        return changes && changes['mode'] && changes['mode'].currentValue !== changes['mode'].previousValue;
    }

    private isValidationChanged(changes: SimpleChanges): boolean {
        return changes && changes['validate'] && changes['validate'].currentValue !== changes['validate'].previousValue;
    }

    private hasPreselectedUsersChanged(changes: SimpleChanges): boolean {
        return changes && changes['preSelectUsers'] && changes['preSelectUsers'].currentValue !== changes['preSelectUsers'].previousValue;
    }

    private hasPreselectedUsersCleared(changes: SimpleChanges): boolean {
        return changes && changes['preSelectUsers'] && changes['preSelectUsers'].currentValue && changes['preSelectUsers'].currentValue.length === 0;
    }

    private resetSearchUsers(): void {
        this.searchUsers = [];
        this.searchUsers$.next(this.searchUsers);
    }

    private setTypingError(): void {
        this.searchUserCtrl.setErrors({
            searchTypingError: true,
            ...this.searchUserCtrl.errors,
        });
    }

    private userChipsControlValue(value?: string) {
        this.userChipsCtrl.setValue(value);
        this.userChipsCtrl.markAsDirty();
        this.userChipsCtrl.markAsTouched();
    }

    getSelectedUsers(): IdentityUserModel[] {
        return this.selectedUsers;
    }

    isReadonly(): boolean {
        return this.readOnly || this.isSingleSelectionReadonly();
    }

    isValidationLoading(): boolean {
        return this.validate && this.validationLoading;
    }

    markAsTouched(): void {
        this.touched = true;
    }

    isTouched(): boolean {
        return this.touched;
    }

    isSelected(): boolean {
        return this.selectedUsers && this.selectedUsers.length > 0;
    }

    isDirty(): boolean {
        return this.isTouched() && !this.isSelected();
    }

    setFocus(isFocused: boolean) {
        this.isFocused = isFocused;
    }

    hasError(): boolean {
        return !!this.searchUserCtrl.errors;
    }

    getValidationPattern(): string {
        return this.searchUserCtrl.errors ? this.searchUserCtrl.errors['pattern']['requiredPattern'] : null;
    }

    getValidationMaxLength(): string {
        return this.searchUserCtrl.errors ? this.searchUserCtrl.errors['maxlength']['requiredLength'] : null;
    }

    getValidationMinLength(): string {
        return this.searchUserCtrl.errors ? this.searchUserCtrl.errors['minlength']['requiredLength'] : null;
    }
}
