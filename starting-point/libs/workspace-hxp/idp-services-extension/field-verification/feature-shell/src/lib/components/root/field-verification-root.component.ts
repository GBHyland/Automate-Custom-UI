/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, inject, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FieldVerificationContextTaskService } from '../../services/context-task/field-verification-context-task.service';
import { ExtractionViewComponent } from '../extraction-view/extraction-view.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IdpShortcutAction, IdpShortcutService, SessionService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'hyland-idp-field-verification-root',
    templateUrl: './field-verification-root.component.html',
    styleUrls: ['./field-verification-root.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExtractionViewComponent, CommonModule, MatButtonModule, MatTooltipModule, MatProgressSpinnerModule, MatCheckbox, TranslatePipe],
})
export class FieldVerificationRootComponent implements OnDestroy {
    screenLoading$: Observable<boolean>;
    taskCanSave$: Observable<boolean>;
    taskCanComplete$: Observable<boolean>;

    private taskCanSave = false;
    private taskCanComplete = false;

    readonly saveTooltip = this.shortcutService.getFullTooltipForAction(IdpShortcutAction.Save);
    readonly submitTooltip = this.shortcutService.getFullTooltipForAction(IdpShortcutAction.Submit);

    readonly isAutoNextTaskChecked$: Observable<boolean>;

    private readonly sessionService = inject(SessionService);

    constructor(
        private readonly contextService: FieldVerificationContextTaskService,
        private readonly shortcutService: IdpShortcutService,
        private readonly destroyRef: DestroyRef
    ) {
        this.screenLoading$ = this.contextService.screenReady$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((ready) => !ready)
        );
        this.taskCanSave$ = this.contextService.taskCanSave$.pipe(takeUntilDestroyed(this.destroyRef));
        this.taskCanComplete$ = this.contextService.taskCanComplete$.pipe(takeUntilDestroyed(this.destroyRef));
        this.taskCanSave$.subscribe((canSave) => (this.taskCanSave = canSave));
        this.taskCanComplete$.subscribe((canComplete) => (this.taskCanComplete = canComplete));

        this.isAutoNextTaskChecked$ = this.sessionService.isAutoNextTaskChecked$.pipe(takeUntilDestroyed(this.destroyRef));
    }

    ngOnDestroy(): void {
        this.contextService.destroy();
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.onShortcutKey(event);
    }

    onSubmit(isAutoNextTaskChecked: boolean | undefined = false) {
        if (this.taskCanComplete) {
            this.contextService.completeTask(isAutoNextTaskChecked);
        }
    }

    onSave() {
        if (this.taskCanSave) {
            this.contextService.saveTask();
        }
    }

    private onShortcutKey(event: KeyboardEvent): boolean {
        if (event.repeat || event.defaultPrevented) {
            return true;
        }

        const shortcut = this.shortcutService.getShortcutForEvent(event);
        switch (shortcut?.action) {
            case IdpShortcutAction.Save: {
                this.onSave();
                return true;
            }
            case IdpShortcutAction.Submit: {
                this.onSubmit();
                return true;
            }
        }

        return false;
    }

    onNextTaskCheckboxCheckedChanged() {
        this.sessionService.toggleAutoNextTask();
    }
}
