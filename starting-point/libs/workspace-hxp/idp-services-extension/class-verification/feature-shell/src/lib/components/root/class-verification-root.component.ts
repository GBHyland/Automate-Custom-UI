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
import { IdpDocumentToolbarService } from '../../services/document/idp-document-toolbar.service';
import { ClassListComponent } from '../document-browser/class-list/class-list.component';
import { ClassVerificationViewerComponent } from '../class-verification-viewer/class-verification-viewer.component';
import { ClassVerificationContextTaskService } from '../../services/context-task/class-verification-context-task.service';
import { SessionService, TaskHeaderAfterBackDirective, TaskHeaderComponent } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { IDP } from '@features';
import { FeaturesDirective } from '@alfresco/adf-core/feature-flags';
import { DocumentUploadButtonComponent } from '../document-upload/upload-button/upload-button.component';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { IdpDocumentImportService } from '../../services/document-import/idp-document-import.service';

@Component({
    selector: 'hyland-idp-class-verification-root',
    templateUrl: './class-verification-root.component.html',
    styleUrls: ['./class-verification-root.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ClassListComponent,
        ClassVerificationViewerComponent,
        CommonModule,
        TaskHeaderComponent,
        TaskHeaderAfterBackDirective,
        MatButtonModule,
        MatProgressSpinnerModule,
        TranslatePipe,
        FeaturesDirective,
        DocumentUploadButtonComponent,
        MatCheckbox,
        MatCheckboxModule,
    ],
})
export class ClassVerificationRootComponent implements OnDestroy {
    idpDocumentUploadFeature = IDP.CLASS_VERIFICATION_DOCUMENT_UPLOAD;

    screenLoading$: Observable<boolean>;
    taskCanSave$: Observable<boolean>;
    taskCanComplete$: Observable<boolean>;

    readonly isDocumentImportEnabled$: Observable<boolean>;
    readonly importAcceptedFileExtensions$: Observable<string[]>;
    readonly isDocumentImportRunning$: Observable<boolean>;

    readonly isAutoNextTaskChecked$: Observable<boolean>;

    private readonly contextService = inject(ClassVerificationContextTaskService);
    private readonly documentToolbarService = inject(IdpDocumentToolbarService);
    private readonly documentImportService = inject(IdpDocumentImportService);
    private readonly sessionService = inject(SessionService);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        this.screenLoading$ = this.contextService.screenReady$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((ready) => !ready)
        );
        this.taskCanSave$ = this.contextService.taskCanSave$.pipe(takeUntilDestroyed(this.destroyRef));
        this.taskCanComplete$ = this.contextService.taskCanComplete$.pipe(takeUntilDestroyed(this.destroyRef));

        this.isDocumentImportEnabled$ = this.documentImportService.isDocumentImportEnabled$.pipe(takeUntilDestroyed(this.destroyRef));
        this.importAcceptedFileExtensions$ = this.documentImportService.importAcceptedFileExtensions$.pipe(takeUntilDestroyed(this.destroyRef));
        this.isDocumentImportRunning$ = this.documentImportService.isDocumentImportRunning$.pipe(takeUntilDestroyed(this.destroyRef));

        this.isAutoNextTaskChecked$ = this.sessionService.isAutoNextTaskChecked$.pipe(takeUntilDestroyed(this.destroyRef));
    }

    ngOnDestroy(): void {
        this.contextService.destroy();
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.onShortcutKey(event);
    }

    onSubmit(isAutoNextTaskChecked: boolean | undefined = false): void {
        this.contextService.completeTask(isAutoNextTaskChecked);
    }

    onSave(): void {
        this.contextService.saveTask();
    }

    onUploadDocuments(files: File[]): void {
        this.documentImportService.queueDocumentUpload(files);
    }

    private onShortcutKey(event: KeyboardEvent): boolean {
        if (event.repeat) {
            event.preventDefault();
            return true;
        }
        return !this.documentToolbarService.handleShortcutAction(event);
    }

    onNextTaskCheckboxCheckedChanged() {
        this.sessionService.toggleAutoNextTask();
    }
}
