/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { trigger, state, style, transition, animate } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { switchMap, mergeMap, filter, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IdentityGroupModel } from '../models/identity-group.model';
import { IdentityGroupService } from '../services/identity-group.service';
import { SHARED_IDENTITY_GROUP_SERVICE_TOKEN } from '../services/identity-group-service.token';
import { InitialGroupNamePipe } from '../pipe/group-initial.pipe';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslatePipe } from '@ngx-translate/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'identity-groups',
    templateUrl: './groups.smart-component.html',
    styleUrls: ['./groups.smart-component.scss'],
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
        MatTooltipModule,
        MatAutocompleteModule,
        MatIconModule,
        MatOptionModule,
        MatInputModule,
        AsyncPipe,
        InitialGroupNamePipe,
        TranslatePipe,
        FormsModule,
        ReactiveFormsModule,
        MatProgressBarModule,
        MatButtonModule,
    ],
})
export class GroupsSmartComponent implements OnInit, OnChanges {
    /** Name of the application. If specified this shows the groups who have access to the app. */
    @Input()
    appName!: string;

    /** Title of the field */
    @Input()
    title!: string;

    /** Group selection mode (single/multiple). */
    @Input()
    mode: 'single' | 'multiple' = 'single';

    /** Array of groups to be pre-selected. This pre-selects all groups in multi selection mode and only the first group of the array in single selection mode. */
    @Input()
    preSelectGroups: IdentityGroupModel[] = [];

    /** This flag enables the validation on the preSelectGroups passed as input.
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

    /** FormControl to list of group */
    @Input()
    groupChipsCtrl = new UntypedFormControl({ value: '', disabled: false });

    /** FormControl to search the group */
    @Input()
    searchGroupsControl = new UntypedFormControl({
        value: '',
        disabled: false,
    });

    /** Role names of the groups to be listed. */
    @Input()
    roles: string[] = [];

    /** Emitted when a group is selected. */
    @Output()
    selectGroup = new EventEmitter<IdentityGroupModel>();

    /** Emitted when a group is removed. */
    @Output()
    removeGroup = new EventEmitter<IdentityGroupModel>();

    /** Emitted when a group selection change. */
    @Output()
    changedGroups = new EventEmitter<IdentityGroupModel[]>();

    /** Emitted when an warning occurs. */
    @Output()
    warning = new EventEmitter<any>();

    @ViewChild('groupInput')
    private groupInput!: ElementRef<HTMLInputElement>;

    private searchGroups: IdentityGroupModel[] = [];
    private readonly destroyRef = inject(DestroyRef);

    selectedGroups: IdentityGroupModel[] = [];
    invalidGroups: IdentityGroupModel[] = [];

    searchGroups$ = new BehaviorSubject<IdentityGroupModel[]>(this.searchGroups);
    subscriptAnimationState = 'enter';
    isFocused!: boolean;
    touched = false;

    validateGroupsMessage!: string;
    searchedValue = '';

    validationLoading = false;
    searchLoading = false;

    typingUniqueValueNotEmpty$!: Observable<any>;

    constructor(
        @Inject(SHARED_IDENTITY_GROUP_SERVICE_TOKEN)
        private identityGroupService: IdentityGroupService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.initSearch();
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (this.hasPreselectedGroupsChanged(changes) || this.hasModeChanged(changes) || this.isValidationChanged(changes)) {
            if (this.hasPreSelectGroups()) {
                await this.loadPreSelectGroups();
            } else if (this.hasPreselectedGroupsCleared(changes)) {
                this.selectedGroups = [];
                this.invalidGroups = [];
            }

            if (!this.isValidationEnabled()) {
                this.invalidGroups = [];
            }
        }

        if (this.isReadonly()) {
            this.searchGroupsControl.disable();
        } else {
            this.searchGroupsControl.enable();
        }
    }

    private initSearch(): void {
        this.initializeStream();
        this.typingUniqueValueNotEmpty$
            .pipe(
                switchMap((name: string) =>
                    this.identityGroupService.search(name, {
                        roles: this.roles,
                        withinApplication: this.appName,
                    })
                ),
                mergeMap((groups: IdentityGroupModel[]) => {
                    this.resetSearchGroups();
                    this.searchLoading = false;
                    return groups;
                }),
                filter((group) => !this.isGroupAlreadySelected(group)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((searchedGroup: IdentityGroupModel) => {
                this.searchGroups.push(searchedGroup);
                this.searchGroups$.next(this.searchGroups);
            });
    }

    private initializeStream() {
        const typingValueFromControl$ = this.searchGroupsControl.valueChanges;

        const typingValueTypeSting$ = typingValueFromControl$.pipe(
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

        const typingValueDebouncedUnique$ = typingValueHandleErrorMessage$.pipe(debounceTime(500), distinctUntilChanged());

        this.typingUniqueValueNotEmpty$ = typingValueDebouncedUnique$.pipe(
            tap((value: string) => {
                if (value.trim()) {
                    this.searchedValue = value;
                } else {
                    this.searchGroupsControl.markAsPristine();
                    this.searchGroupsControl.markAsUntouched();
                }
            }),
            tap(() => this.resetSearchGroups())
        );
    }

    private isGroupAlreadySelected(group: IdentityGroupModel): boolean {
        if (this.selectedGroups && this.selectedGroups.length > 0) {
            const result = this.selectedGroups.find((selectedGroup: IdentityGroupModel) => selectedGroup.name === group.name);

            return !!result;
        }
        return false;
    }

    private async searchGroup(name?: string): Promise<IdentityGroupModel[]> {
        return firstValueFrom(this.identityGroupService.search(name));
    }

    private getPreselectedGroups(): IdentityGroupModel[] {
        if (this.isSingleMode()) {
            return [this.preSelectGroups[0]];
        } else {
            return this.removeDuplicatedGroups(this.preSelectGroups);
        }
    }

    private async validatePreselectGroups(): Promise<any> {
        this.invalidGroups = [];

        for (const group of this.getPreselectedGroups()) {
            try {
                const groupsFound = await this.searchGroup(group.name);
                const validationResult = groupsFound[0];
                if (this.isPreselectedGroupInvalid(group, validationResult)) {
                    this.invalidGroups.push(group);
                } else {
                    group.id = validationResult.id;
                }
            } catch (error) {
                this.invalidGroups.push(group);
            }
        }

        this.checkPreselectValidationErrors();
    }

    private checkPreselectValidationErrors(): void {
        this.invalidGroups = this.removeDuplicatedGroups(this.invalidGroups);

        if (this.invalidGroups.length > 0) {
            this.generateInvalidGroupsMessage();
        }

        this.warning.emit({
            message: 'INVALID_PRESELECTED_GROUPS',
            groups: this.invalidGroups,
        });
    }

    private generateInvalidGroupsMessage(): void {
        this.validateGroupsMessage = '';

        this.invalidGroups.forEach((invalidGroup: IdentityGroupModel, index) => {
            if (index === this.invalidGroups.length - 1) {
                this.validateGroupsMessage += `${invalidGroup.name} `;
            } else {
                this.validateGroupsMessage += `${invalidGroup.name}, `;
            }
        });
    }

    private async loadPreSelectGroups(): Promise<void> {
        if (this.isValidationEnabled()) {
            this.validationLoading = true;
            this.cdr.detectChanges();
            await this.validatePreselectGroups();
            this.validationLoading = false;
        }

        this.selectedGroups = [...this.getPreselectedGroups()];

        this.groupChipsCtrl.setValue(this.selectedGroups[0].name);

        this.cdr.detectChanges();
    }

    onSelect(group: IdentityGroupModel): void {
        if (group) {
            this.selectGroup.emit(group);

            if (this.isMultipleMode()) {
                if (!this.isGroupAlreadySelected(group)) {
                    this.selectedGroups.push(group);
                }
            } else {
                this.invalidGroups = [];
                this.selectedGroups = [group];
            }

            this.groupInput.nativeElement.value = '';
            this.searchGroupsControl.setValue('');
            this.groupChipsCtrlValue(this.selectedGroups[0].name);

            this.changedGroups.emit(this.selectedGroups);
            this.resetSearchGroups();
        }
    }

    onRemove(groupToRemove: IdentityGroupModel): void {
        this.removeGroup.emit(groupToRemove);
        this.removeGroupFromSelected(groupToRemove);
        this.changedGroups.emit(this.selectedGroups);
        if (this.selectedGroups.length === 0) {
            this.groupChipsCtrlValue('');
        } else {
            this.groupChipsCtrlValue(this.selectedGroups[0].name);
        }
        this.searchGroupsControl.markAsDirty();
        this.searchGroupsControl.markAsTouched();

        if (this.isValidationEnabled()) {
            this.removeGroupFromValidation(groupToRemove);
            this.checkPreselectValidationErrors();
        }
    }

    private isPreselectedGroupInvalid(preselectedGroup: IdentityGroupModel, validatedGroup: IdentityGroupModel): boolean {
        if (validatedGroup && validatedGroup.name !== undefined) {
            return preselectedGroup.name !== validatedGroup.name;
        } else {
            return true;
        }
    }

    removeDuplicatedGroups(groups: IdentityGroupModel[]): IdentityGroupModel[] {
        return groups.filter(
            (group, index, self) => index === self.findIndex((auxGroup) => group.id === auxGroup.id && group.name === auxGroup.name)
        );
    }

    private groupChipsCtrlValue(value?: string) {
        this.groupChipsCtrl.setValue(value);
        this.groupChipsCtrl.markAsDirty();
        this.groupChipsCtrl.markAsTouched();
    }

    private removeGroupFromSelected({ id, name }: IdentityGroupModel): void {
        const indexToRemove = this.selectedGroups.findIndex((group) => group.id === id && group.name === name);

        if (indexToRemove !== -1) {
            this.selectedGroups.splice(indexToRemove, 1);
        }
    }

    private removeGroupFromValidation({ id, name }: IdentityGroupModel): void {
        const indexToRemove = this.invalidGroups.findIndex((group) => group.id === id && group.name === name);

        if (indexToRemove !== -1) {
            this.invalidGroups.splice(indexToRemove, 1);
        }
    }

    private resetSearchGroups(): void {
        this.searchGroups = [];
        this.searchGroups$.next(this.searchGroups);
    }

    private isSingleSelectionReadonly(): boolean {
        return this.isSingleMode() && this.selectedGroups.length === 1 && this.selectedGroups[0].readonly === true;
    }

    private isSingleMode(): boolean {
        return this.mode === 'single';
    }

    private isMultipleMode(): boolean {
        return this.mode === 'multiple';
    }

    private hasPreSelectGroups(): boolean {
        return this.preSelectGroups && this.preSelectGroups.length > 0;
    }

    private hasModeChanged(changes: SimpleChanges): boolean {
        return changes && changes['mode'] && changes['mode'].currentValue !== changes['mode'].previousValue;
    }

    private isValidationChanged(changes: SimpleChanges): boolean {
        return changes && changes['validate'] && changes['validate'].currentValue !== changes['validate'].previousValue;
    }

    private hasPreselectedGroupsChanged(changes: SimpleChanges): boolean {
        return changes && changes['preSelectGroups'] && changes['preSelectGroups'].currentValue !== changes['preSelectGroups'].previousValue;
    }

    private hasPreselectedGroupsCleared(changes: SimpleChanges): boolean {
        return changes && changes['preSelectGroups'] && changes['preSelectGroups'].currentValue.length === 0;
    }

    private setTypingError(): void {
        this.searchGroupsControl.setErrors({
            searchTypingError: true,
            ...this.searchGroupsControl.errors,
        });
    }

    hasPreselectError(): boolean {
        return this.invalidGroups && this.invalidGroups.length > 0;
    }

    isReadonly(): boolean {
        return this.readOnly || this.isSingleSelectionReadonly();
    }

    getDisplayName(group: IdentityGroupModel): string {
        return group ? group.name || '' : '';
    }

    hasError(): boolean {
        return !!this.searchGroupsControl.errors;
    }

    isValidationLoading(): boolean {
        return this.isValidationEnabled() && this.validationLoading;
    }

    markAsTouched(): void {
        this.touched = true;
    }

    isTouched(): boolean {
        return this.touched;
    }

    isSelected(): boolean {
        return this.selectedGroups && this.selectedGroups.length > 0;
    }

    isDirty(): boolean {
        return this.isTouched() && !this.isSelected();
    }

    setFocus(isFocused: boolean) {
        this.isFocused = isFocused;
    }

    isValidationEnabled(): boolean {
        return this.validate === true;
    }

    getValidationPattern(): string {
        return this.searchGroupsControl.errors ? this.searchGroupsControl.errors['pattern']['requiredPattern'] : null;
    }

    getValidationMaxLength(): string {
        return this.searchGroupsControl.errors ? this.searchGroupsControl.errors['maxlength']['requiredLength'] : null;
    }

    getValidationMinLength(): string {
        return this.searchGroupsControl.errors ? this.searchGroupsControl.errors['minlength']['requiredLength'] : null;
    }
}
