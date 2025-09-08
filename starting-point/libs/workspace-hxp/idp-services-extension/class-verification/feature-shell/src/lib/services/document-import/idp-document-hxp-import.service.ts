/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DEFAULT_REPOSITORY_ID } from '@alfresco/adf-hx-content-services/api';
import { DocumentService as AdfDocumentService, DocumentCreateProperties } from '@alfresco/adf-hx-content-services/services';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { catchError, combineLatest, filter, map, merge, Observable, of, switchMap, take, tap } from 'rxjs';
import { selectCorrelationId, selectTaskInputData } from '../../store/selectors/screen.selectors';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { FileModel, FileUploadStatus, HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import {
    selectAcceptedFileExtensions,
    selectAcceptedFileSize,
    selectIsDocumentImportEnabled,
    selectIsDocumentImportRunning,
    selectImportingDocumentById,
    selectUploadFolderId,
} from '../../store/selectors/screen-importing-document.selectors';
import { v4 } from 'uuid';
import { DocumentImportingStatus, ImportingDocument } from '../../store/states/importing-document.state';
import { systemActions, userActions } from '../../store/actions/class-verification.actions';
import { IdpDocumentImportService, QueueDocumentUploadResult } from './idp-document-import.service';
import { IdpDocumentMetadataService } from './idp-document-metadata.service';
import { cloneDeep } from 'es-toolkit/compat';

export const DocumentUploadErrorCode = {
    ProhibitedType: 1051001120,
    ExceedsSize: 1051001121,
};

export type DocumentUploadErrorCode = typeof DocumentUploadErrorCode[keyof typeof DocumentUploadErrorCode];

@Injectable()
export class IdpDocumentHxpImportService implements IdpDocumentImportService {
    static readonly PATH_SEPARATOR = '/';

    readonly isDocumentImportEnabled$: Observable<boolean>;
    readonly importAcceptedFileExtensions$: Observable<string[]>;
    readonly isDocumentImportRunning$: Observable<boolean>;

    readonly documentUploadProgress$: Observable<ImportingDocument>;
    readonly documentUploadComplete$: Observable<ImportingDocument>;
    readonly documentUploadCancelled$: Observable<ImportingDocument>;

    readonly documentMetadataExtractionCompleted$: Observable<ImportingDocument>;
    readonly documentMetadataExtractionError$: Observable<ImportingDocument>;
    readonly documentMetadataExtractionCancelled$: Observable<ImportingDocument>;

    readonly documentUploadError$: Observable<ImportingDocument>;

    private readonly adfDocumentService = inject(AdfDocumentService);
    private readonly hxpUploadService = inject(HxpUploadService);
    private readonly metadataService = inject(IdpDocumentMetadataService);
    private readonly store = inject(Store);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        this.adfDocumentService.setCurrentRepository(DEFAULT_REPOSITORY_ID);

        this.isDocumentImportEnabled$ = this.store.select(selectIsDocumentImportEnabled).pipe(takeUntilDestroyed(this.destroyRef));
        this.importAcceptedFileExtensions$ = this.store.select(selectAcceptedFileExtensions).pipe(takeUntilDestroyed(this.destroyRef));
        this.isDocumentImportRunning$ = this.store.select(selectIsDocumentImportRunning).pipe(takeUntilDestroyed(this.destroyRef));

        this.documentUploadProgress$ = merge(this.hxpUploadService.fileUploadStarting, this.hxpUploadService.fileUploadProgress).pipe(
            takeUntilDestroyed(this.destroyRef),
            filter((event) => !!event.file.id),
            map((event) => this.asUploadedDocument(event.file, DocumentImportingStatus.Progress))
        );

        this.documentUploadProgress$.subscribe((document) =>
            this.store.dispatch(systemActions.documentUploadProgress({ documentId: document.id, progress: document.progress }))
        );

        this.documentUploadComplete$ = this.hxpUploadService.fileUploadComplete.pipe(
            takeUntilDestroyed(this.destroyRef),
            filter((event) => !!event.file.id),
            map((event) => this.asUploadedDocument(event.file, DocumentImportingStatus.Progress))
        );

        this.documentUploadComplete$.subscribe((document) => {
            if (document.fileUploadId) {
                this.store.dispatch(systemActions.documentUploadComplete({ documentId: document.id, fileUploadId: document.fileUploadId }));
            } else {
                console.error('Document upload complete event received without fileUploadId', document.id);
                this.store.dispatch(systemActions.documentUploadError({ documentId: document.id }));
            }
        });

        this.documentUploadCancelled$ = merge(
            this.hxpUploadService.fileUploadAborted,
            this.hxpUploadService.fileUploadCancelled,
            this.hxpUploadService.fileUploadDeleted
        ).pipe(
            takeUntilDestroyed(this.destroyRef),
            filter((event) => !!event.file.id),
            map((event) => this.asUploadedDocument(event.file, DocumentImportingStatus.Cancelled))
        );

        this.documentUploadCancelled$.subscribe((document) => {
            this.store.dispatch(systemActions.documentUploadCancelled({ documentIds: [document.id] }));
        });

        this.documentUploadError$ = this.hxpUploadService.fileUploadError.pipe(
            takeUntilDestroyed(this.destroyRef),
            filter((event) => !!event.file.id),
            map((event) => this.asUploadedDocument(event.file, DocumentImportingStatus.Error))
        );

        this.documentUploadError$.subscribe((document) => {
            this.store.dispatch(systemActions.documentUploadError({ documentId: document.id }));
        });

        this.documentMetadataExtractionCompleted$ = this.metadataService.documentMetadataExtractionSuccess$.pipe(
            takeUntilDestroyed(this.destroyRef),
            filter((doc) => !!doc),
            map((doc) => {
                const document = cloneDeep(doc);
                document.progress = 100;
                document.importingStatus = DocumentImportingStatus.Complete;
                return document;
            })
        );

        this.documentMetadataExtractionError$ = this.metadataService.documentMetadataExtractionError$.pipe(
            takeUntilDestroyed(this.destroyRef),
            filter((doc) => !!doc),
            map((doc) => {
                const document = cloneDeep(doc);
                document.importingStatus = DocumentImportingStatus.Error;
                return document;
            })
        );

        this.documentMetadataExtractionCancelled$ = this.metadataService.documentMetadataExtractionCancelled$.pipe(
            takeUntilDestroyed(this.destroyRef),
            filter((doc) => !!doc),
            map((doc) => {
                const document = cloneDeep(doc);
                document.importingStatus = DocumentImportingStatus.Cancelled;
                return document;
            })
        );
    }

    isDocumentUploadTargetFolderExists$(): Observable<boolean> {
        return this.store.select(selectTaskInputData).pipe(
            takeUntilDestroyed(this.destroyRef),
            take(1),
            switchMap((data) => {
                if (!data) {
                    throw new Error('No task input data found');
                }
                if (!data.targetFolder) {
                    return of(false);
                }

                return this.isFolderExists$(data.targetFolder);
            })
        );
    }

    queueDocumentUpload(files: File[]): void {
        this.store.dispatch(userActions.queueDocumentUpload({ files }));
    }

    queueDocumentUpload$(files: File[]): Observable<QueueDocumentUploadResult> {
        return combineLatest([
            this.store.select(selectAcceptedFileExtensions),
            this.store.select(selectAcceptedFileSize),
            this.store.select(selectUploadFolderId),
        ]).pipe(
            takeUntilDestroyed(this.destroyRef),
            take(1),
            map(([acceptFileExtensions, acceptFileSize, uploadFolderId]) => {
                const validFileModels: FileModel[] = [];
                const erroneousFileModels: FileModel[] = [];
                for (const file of files) {
                    const fileModel = this.asFileModel(file, uploadFolderId);
                    const dotIndex = file.name.lastIndexOf('.');
                    if (dotIndex < 0 || !acceptFileExtensions.includes(file.name.slice(dotIndex + 1))) {
                        fileModel.status = FileUploadStatus.Error;
                        fileModel.errorCode = DocumentUploadErrorCode.ProhibitedType;
                    }
                    if (file.size > acceptFileSize) {
                        fileModel.status = FileUploadStatus.Error;
                        fileModel.errorCode = DocumentUploadErrorCode.ExceedsSize;
                    }
                    if (fileModel.status === FileUploadStatus.Error) {
                        erroneousFileModels.push(fileModel);
                    } else {
                        validFileModels.push(fileModel);
                    }
                }
                return [validFileModels, erroneousFileModels];
            }),
            tap(([validFileModels]) => {
                if (validFileModels.length > 0) {
                    this.hxpUploadService.addToQueue(...structuredClone(validFileModels));
                    this.hxpUploadService.uploadFilesInTheQueue();
                }
            }),
            map(([validFileModels, erroneousFileModels]) => {
                return {
                    queued: validFileModels.map((fileModel) => this.asUploadedDocument(fileModel, DocumentImportingStatus.Pending)),
                    erroneous: erroneousFileModels.map((fileModel) => this.asUploadedDocument(fileModel, DocumentImportingStatus.Error)),
                };
            })
        );
    }

    cancelDocumentUpload(documentIds: string[]): void {
        const queuedUploadsToCancel = this.hxpUploadService.getQueue().filter((file) => file.id && documentIds.includes(file.id));
        this.hxpUploadService.cancelUpload(...queuedUploadsToCancel);
        for (const documentId of documentIds) {
            this.store
                .select(selectImportingDocumentById(documentId))
                .pipe(take(1))
                .subscribe((document) => {
                    if (document) {
                        this.metadataService.cancelExtractDocumentMetadata(document);
                    }
                });
        }
    }

    createDocumentUnderProcessDocumentUploadFolder$(document: ImportingDocument): Observable<[string, string]> {
        return this.store.select(selectUploadFolderId).pipe(
            takeUntilDestroyed(this.destroyRef),
            take(1),
            switchMap((parentId) => {
                return parentId ? of(parentId) : this.getProcessDocumentUploadFolderId$();
            }),
            switchMap((parentId) => {
                return this.adfDocumentService
                    .createDocument({
                        sys_name: document.fileName,
                        sys_title: document.fileName,
                        sys_parentId: parentId,
                        sys_primaryType: 'SysFile',
                        sysfile_blob: {
                            uploadId: document.fileUploadId,
                        },
                    })
                    .pipe(map((created): [string, string] => [this.getDocumentIdOrThrow(created), parentId]));
            })
        );
    }

    private getProcessDocumentUploadFolderId$(): Observable<string> {
        return combineLatest([this.store.select(selectCorrelationId), this.getDocumentUploadTargetFolder$()]).pipe(
            takeUntilDestroyed(this.destroyRef),
            take(1),
            switchMap(([correlationId, targetFolder]) =>
                this.getProcessDocumentUploadFolder$(correlationId, targetFolder).pipe(map((document) => this.getDocumentIdOrThrow(document)))
            )
        );
    }

    private getDocumentUploadTargetFolder$(): Observable<Document> {
        return this.store.select(selectTaskInputData).pipe(
            takeUntilDestroyed(this.destroyRef),
            take(1),
            switchMap((data) => {
                if (!data) {
                    throw new Error('No task input data found');
                }
                if (!data.targetFolder) {
                    throw new Error('No target folder set');
                }

                return this.getFolder$(data.targetFolder);
            })
        );
    }

    private getProcessDocumentUploadFolder$(correlationId: string, targetFolder: Document): Observable<Document> {
        const targetFolderId = this.getDocumentIdOrThrow(targetFolder);
        const processFolderPath = `${targetFolder.sys_path}${IdpDocumentHxpImportService.PATH_SEPARATOR}${correlationId}`;
        return this.getFolder$(processFolderPath).pipe(
            takeUntilDestroyed(this.destroyRef),
            switchMap((document) => of(document)),
            catchError((error) => {
                if (error.status === 404) {
                    return this.createFolder$(correlationId, targetFolderId);
                } else {
                    console.error(error);
                    throw error;
                }
            })
        );
    }

    private getFolder$(path: string): Observable<Document> {
        return this.adfDocumentService.getDocumentByPath(path).pipe(
            takeUntilDestroyed(this.destroyRef),
            map((document) => {
                if (!document.sys_isFolderish) {
                    throw new Error('Document is not a folder');
                }

                return document;
            })
        );
    }

    private isFolderExists$(path: string): Observable<boolean> {
        return this.getFolder$(path).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(() => true),
            catchError((error) => {
                if (error.status === 404) {
                    return of(false);
                } else {
                    console.error(error);
                    throw error;
                }
            })
        );
    }

    private getDocumentIdOrThrow(document: Document): string {
        if (!document.sys_id) {
            throw new Error('No document id returned');
        }
        return document.sys_id;
    }

    private createFolder$(name: string, parentId: string): Observable<Document> {
        const folderProperties: DocumentCreateProperties = {
            sys_primaryType: 'SysFolder',
            sys_name: name,
            sys_parentId: parentId,
        };
        return this.adfDocumentService.createDocument(folderProperties).pipe(
            takeUntilDestroyed(this.destroyRef),
            switchMap((res) => of(res))
        );
    }

    private asFileModel(file: File, parentId: string | undefined): FileModel {
        return new FileModel(
            file,
            {
                parentId,
                path: ((file as any).webkitRelativePath ?? '').replace(/\/[^/]*$/),
            },
            v4()
        );
    }

    private asUploadedDocument(file: FileModel, importingStatus: DocumentImportingStatus): ImportingDocument {
        return {
            id: file.id ?? v4(),
            fileUploadId: file.data?.id,
            fileName: file.name,
            progress: this.calculateProgress(file),
            importingStatus: importingStatus,
            errorCode: file.errorCode ?? undefined,
        };
    }

    private calculateProgress(file: FileModel): number {
        if (!file.progress?.total) {
            return 0;
        }
        const percent = Math.ceil((file.progress.loaded / file.progress.total) * 100);
        return Math.min(percent, 70);
    }
}
