/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { OnInit, Component, ViewEncapsulation, inject, DestroyRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import {
    DocumentService,
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    HxpNotificationService,
    UserResolverPipe,
} from '@alfresco/adf-hx-content-services/services';
import { catchError, concatMap, filter, map, mergeMap, switchMap, take } from 'rxjs/operators';
import { AttachFileDialogData, SelectionMode } from '@hxp/shared-hxp/form-widgets/feature-shell';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { UPLOAD_MIDDLEWARE_SERVICE, UploadSuccessData } from '@hxp/shared-hxp/services';
import {
    HxpUploadService,
    HxpUploadDragAreaComponent,
    HxpUploadingDialogComponent,
    UploadHxpButtonComponent,
} from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { STUDIO_HXP } from '@features';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ContentTypeIconComponent, DeleteButtonActionService, HxpDocumentListComponent } from '@alfresco/adf-hx-content-services/ui';
import { DataColumnComponent, DataColumnListComponent, EmptyListComponent, FileSizePipe, provideTranslations, TimeAgoPipe } from '@alfresco/adf-core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { UploadFileDocumentCreatorService } from '@alfresco-dbp/workspace-hxp/process-services-cloud-extension/process-form/data-access';

export const CONTENT_REPOSITORY_DEFAULT_PATH = ROOT_DOCUMENT.sys_path as string;

@Component({
    standalone: true,
    selector: 'hxp-attach-file-dialog',
    templateUrl: './attach-file-dialog.component.html',
    styleUrls: ['./attach-file-dialog.component.scss'],
    host: { class: 'hxp-attach-file-dialog' },
    imports: [
        AsyncPipe,
        TimeAgoPipe,
        FileSizePipe,
        MatTabsModule,
        MatIconModule,
        TranslatePipe,
        MatDialogModule,
        MatButtonModule,
        UserResolverPipe,
        EmptyListComponent,
        DataColumnComponent,
        DataColumnListComponent,
        ContentTypeIconComponent,
        HxpDocumentListComponent,
        MatProgressSpinnerModule,
        UploadHxpButtonComponent,
        HxpUploadDragAreaComponent,
        HxpUploadingDialogComponent,
    ],
    providers: [
        provideTranslations('adf-enterprise-adf-hx-content-services-services', 'assets/adf-enterprise-adf-hx-content-services-services'),
        {
            provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE,
            useClass: DeleteButtonActionService,
        },
        HxpUploadService,
        UploadFileDocumentCreatorService,
        {
            provide: UPLOAD_MIDDLEWARE_SERVICE,
            useExisting: UploadFileDocumentCreatorService,
        },
    ],
    encapsulation: ViewEncapsulation.None,
})
export class AttachFileDialogComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly uploadService = inject(HxpUploadService);
    private readonly documentService = inject(DocumentService);
    private readonly dialog = inject(MatDialogRef<AttachFileDialogComponent>);
    private readonly notificationService = inject(HxpNotificationService);
    private readonly featuresService: IFeaturesService = inject(FeaturesServiceToken);

    data: AttachFileDialogData = inject(MAT_DIALOG_DATA);
    showDragAndDropPlaceholder = true;
    selectedTabIndex = 0;
    documentNavigationStack: Document[] = [];
    insideErrorMessage = '';

    displayedDocumentSubject$ = new BehaviorSubject<Document | null>(null);
    displayedDocument$ = this.displayedDocumentSubject$.asObservable();

    fetchDocumentCollectionSubject$ = new BehaviorSubject<Document[]>([]);
    fetchDocumentCollection$ = this.fetchDocumentCollectionSubject$.asObservable();

    chosenDocuments$ = new BehaviorSubject<Document[]>([]);

    isAttachButtonDisabled$: Observable<boolean> = this.chosenDocuments$.pipe(
        map((chosenDocuments) => {
            return chosenDocuments.filter((document) => !document.sys_isFolderish);
        }),
        map((chosenDocuments) => {
            const selectionMode = this.data.selectionMode;
            return (
                (selectionMode === SelectionMode.single && chosenDocuments.length !== 1) ||
                (selectionMode === SelectionMode.multiple && chosenDocuments.length === 0)
            );
        }),
        takeUntilDestroyed(this.destroyRef)
    );

    isAttachFileWidgetDefaultFolderOn$: Observable<boolean> = this.featuresService
        .isOn$(STUDIO_HXP.ATTACH_FILE_WIDGET_DEFAULT_FOLDER)
        .pipe(takeUntilDestroyed(this.destroyRef));
    isContentEnabled = true;

    get isUploadTabSelected(): boolean {
        return this.selectedTabIndex === 1;
    }

    get isUploadEnabled(): boolean {
        return this.data?.isLocalUploadAvailable;
    }

    ngOnInit(): void {
        this.isAttachFileWidgetDefaultFolderOn$.subscribe((isFeatureFlagOn) => {
            if (isFeatureFlagOn) {
                if (!this.data.isContentUploadAvailable) {
                    this.isContentEnabled = false;

                    if (this.data.isLocalUploadAvailable) {
                        this.selectedTabIndex = 1;
                    }
                }
            } else {
                if (!this.data.isLocalUploadAvailable) {
                    this.data.defaultDocumentPath$ = of(CONTENT_REPOSITORY_DEFAULT_PATH);
                }
            }

            this.data.defaultDocumentPath$
                .pipe(
                    mergeMap((defaultFolder) => {
                        return defaultFolder ? this.getDocumentByPath(defaultFolder as string) : of(null);
                    }),
                    catchError(() => {
                        this.notificationService.showError('ATTACH_FILE_DIALOG.FOLDER_DOES_NOT_EXIST');
                        this.close();

                        return of(null);
                    }),
                    takeUntilDestroyed(this.destroyRef)
                )
                .subscribe((document) => {
                    if (document) {
                        this.checkDocumentPrimaryType(document);
                    } else {
                        this.notificationService.showError('ATTACH_FILE_DIALOG.FOLDER_DOES_NOT_EXIST');
                        this.close();
                    }
                });
        });

        this.displayedDocument$
            .pipe(
                filter((document) => !!document),
                switchMap((doc) => this.fetchChildren(doc)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((documents) => {
                this.fetchDocumentCollectionSubject$.next(documents);
            });

        merge(this.uploadService.fileUploadSuccess, this.documentService.documentDeleted$)
            .pipe(
                concatMap(() => {
                    const lastDocument = this.documentNavigationStack.at(-1);
                    return lastDocument ? this.getDocumentByPath(lastDocument.sys_path as string) : of(null);
                }),
                filter((document) => !!document),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((document) => {
                this.displayedDocumentSubject$.next({ ...document });
            });
    }

    onUploadStart(): void {
        this.showDragAndDropPlaceholder = false;
    }

    onSuccessUpload(uploadedFiles: UploadSuccessData<Document>): void {
        let uploadedDocument: Document;
        if (uploadedFiles.middlewareResults) {
            uploadedDocument = uploadedFiles.middlewareResults;
            this.chosenDocuments$.pipe(take(1)).subscribe((chosenDocuments) => {
                if (this.data.selectionMode === SelectionMode.single) {
                    this.chosenDocuments$.next([uploadedDocument]);
                } else if (this.data.selectionMode === SelectionMode.multiple) {
                    const combinedDocuments = [...chosenDocuments, uploadedDocument];
                    this.chosenDocuments$.next(
                        combinedDocuments.filter((doc, index, array) => array.findIndex((d) => d.sys_id === doc.sys_id) === index)
                    );
                }
            });
        }
    }

    onSelectedDocuments($event: Document[]): void {
        this.chosenDocuments$.next($event);
    }

    navigateForward(document: Document): void {
        if (document.sys_isFolderish) {
            this.displayedDocumentSubject$.next(document);
            this.documentNavigationStack.push(document);
        }
    }

    navigateBack(document: Document): void {
        this.chosenDocuments$.next([]);
        this.displayedDocumentSubject$.next(document);
        this.documentNavigationStack = this.documentNavigationStack.slice(0, this.documentNavigationStack.indexOf(document) + 1);
    }

    close(): void {
        this.dialog.close();
    }

    onAttachButtonClick(): void {
        this.chosenDocuments$.subscribe((chosenDocuments) => {
            this.data.selectionSubject$.next(chosenDocuments);
            this.close();
        });
    }

    onTabSelectionChange(tabIndex: number): void {
        this.selectedTabIndex = tabIndex;
    }

    private checkDocumentPrimaryType(document: Document | null): void {
        if (document) {
            if (document.sys_primaryType === ROOT_DOCUMENT.sys_primaryType) {
                document.sys_title = ROOT_DOCUMENT.sys_primaryType;
            }
            this.navigateForward(document);
        }
    }

    private getDocumentByPath(path: string): Observable<Document | null> {
        return this.documentService.getDocumentByPath(path).pipe(
            catchError((e) => {
                if (e.toString().includes('code 5')) {
                    this.notificationService.showError('ATTACH_FILE_DIALOG.CONTENT_SERVICE_UNAVAILABLE');
                } else if (e.toString().includes('code 403')) {
                    this.insideErrorMessage = 'ATTACH_FILE_DIALOG.FOLDER_ACCESS_DENIED';
                    return of(null);
                } else {
                    this.notificationService.showError('ATTACH_FILE_DIALOG.FOLDER_NAME_DOES_NOT_EXIST', undefined, {
                        folderName: path.split('/').pop(),
                    });
                }
                this.close();
                return of({ sys_primaryType: 'SysFolder' });
            }),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    private fetchChildren(document: Document): Observable<Document[]> {
        return this.documentService.getAllChildren(document.sys_id || '').pipe(
            map((result) => {
                return result.documents;
            }),
            catchError((error) => {
                console.error(error);
                return of([]);
            }),
            takeUntilDestroyed(this.destroyRef)
        );
    }
}
