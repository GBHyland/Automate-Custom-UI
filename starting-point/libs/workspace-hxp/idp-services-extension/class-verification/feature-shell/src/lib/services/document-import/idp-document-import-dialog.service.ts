/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { DocumentImportProgressDialogComponent } from '../../dialogs/document-import-progress-dialog/document-import-progress.dialog';
import { BehaviorSubject, forkJoin, merge, Observable, Subject, withLatestFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentImportingStatus, ImportingDocument } from '../../store/states/importing-document.state';
import { Store } from '@ngrx/store';
import {
    selectImportingDocumentErrorCode,
    selectImportingDocumentProgress,
    selectImportingDocumentStatus,
} from '../../store/selectors/screen-importing-document.selectors';
import { systemActions, userActions } from '../../store/actions/class-verification.actions';
import { IdpDocumentImportService } from './idp-document-import.service';

export class DocumentImportStatus {
    constructor(
        public readonly fileId: string,
        public readonly fileName: string,
        public readonly importStatus$: Observable<DocumentImportingStatus | undefined>,
        public readonly progress$: Observable<number | undefined>,
        public readonly errorCode$: Observable<number | undefined>
    ) {}
}

class DocumentUploadCompletion {
    readonly done$: Subject<void>;

    constructor(public readonly fileId: string, public readonly fileName: string) {
        this.done$ = new Subject<void>();
    }

    done(): void {
        this.done$.next();
        this.done$.complete();
    }
}

@Injectable()
export class IdpDocumentImportDialogService {
    private readonly documentImportStatuses$ = new BehaviorSubject<DocumentImportStatus[]>([]);
    private readonly documentImportCompletions$ = new BehaviorSubject<DocumentUploadCompletion[]>([]);
    private dialogRef?: MatDialogRef<DocumentImportProgressDialogComponent>;

    private readonly documentImportService = inject(IdpDocumentImportService);
    private readonly dialog = inject(MatDialog);
    private readonly store = inject(Store);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        merge(
            this.documentImportService.documentUploadCancelled$,
            this.documentImportService.documentUploadError$,
            this.documentImportService.documentMetadataExtractionCompleted$,
            this.documentImportService.documentMetadataExtractionError$,
            this.documentImportService.documentMetadataExtractionCancelled$
        )
            .pipe(takeUntilDestroyed(this.destroyRef), withLatestFrom(this.documentImportCompletions$))
            .subscribe(([document, entryStates]) => {
                const fileId = document.id;
                const fileName = document.fileName;
                const found = fileId
                    ? entryStates.find((state) => state.fileId === fileId)
                    : entryStates.find((state) => state.fileName === fileName);
                found?.done();
            });
    }

    queueDocumentUpload(documents: ImportingDocument[]): void {
        if (this.dialogRef) {
            const dialogState = this.dialogRef.getState();
            if (dialogState === MatDialogState.CLOSING) {
                this.dialogRef.afterClosed().subscribe(() => {
                    this.openDocumentUploadProgressDialog();
                });
            }
            if (dialogState === MatDialogState.CLOSED) {
                this.openDocumentUploadProgressDialog();
            }
        } else {
            this.openDocumentUploadProgressDialog();
        }

        this.populateDocumentUploadEntries(documents);
    }

    private populateDocumentUploadEntries(documents: ImportingDocument[]): void {
        const entries = documents.map((document) => this.createDocumentUploadEntry(document));
        const entryStates = documents
            .filter(
                (document) =>
                    document.importingStatus === DocumentImportingStatus.Pending || document.importingStatus === DocumentImportingStatus.Progress
            )
            .map((document) => new DocumentUploadCompletion(document.id, document.fileName));

        forkJoin(entryStates.map((state) => state.done$)).subscribe(() => {
            this.dialogRef?.close();
            this.store.dispatch(systemActions.documentImportFinished());
            this.documentImportStatuses$.next([]);
            this.documentImportCompletions$.next([]);
        });

        this.documentImportStatuses$.next(entries);
        this.documentImportCompletions$.next(entryStates);
    }

    private createDocumentUploadEntry(document: ImportingDocument): DocumentImportStatus {
        return new DocumentImportStatus(
            document.id,
            document.fileName,
            this.store.select(selectImportingDocumentStatus(document.id)),
            this.store.select(selectImportingDocumentProgress(document.id)),
            this.store.select(selectImportingDocumentErrorCode(document.id))
        );
    }

    private openDocumentUploadProgressDialog(): void {
        this.dialogRef = DocumentImportProgressDialogComponent.open(this.dialog, this.documentImportStatuses$);
        this.dialogRef.componentInstance.cancelDocumentUpload.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((documents) => {
            this.store.dispatch(userActions.cancelDocumentUpload({ documentIds: documents.map((document) => document.fileId) }));
        });
    }
}
