/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DocumentService, HxpNotificationService, RouterExtService, DocumentRouterService } from '@alfresco/adf-hx-content-services/services';
import { from, Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap, toArray } from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ContentDeletedDialogResponse, ContentDeleteDialogData } from '../configs/delete-dialog.interface';
import { DeletedStatus } from '../configs/deleted-status.enum';
import { deleteItemNotificationMessages } from '../configs/delete-notification-messages.config';
import { deleteSnackBarTypes } from '../configs/delete-snack-bar-types.model';
import { NgClass, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'hxp-content-delete-confirmation-dialog',
    templateUrl: './content-delete-confirmation-dialog.component.html',
    styleUrls: ['./content-delete-confirmation-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatDialogModule, MatIconModule, MatButtonModule, NgClass, NgIf, MatProgressSpinnerModule, TranslatePipe],
})
export class ContentDeleteConfirmationDialogComponent {
    protected dialogTitle!: string;
    protected dialogDescription!: string;
    protected isDeleting: boolean;

    private readonly deleteDocument$: Observable<ContentDeletedDialogResponse[]>;
    private readonly documents: Document[] = [];
    private readonly shouldRedirect: boolean;
    private readonly refererURL;

    constructor(
        @Inject(MAT_DIALOG_DATA) private dialogData: ContentDeleteDialogData,
        private dialogRef: MatDialogRef<ContentDeleteConfirmationDialogComponent>,
        private hxpNotificationService: HxpNotificationService,
        private documentService: DocumentService,
        private documentRouterService: DocumentRouterService,
        private routerExtService: RouterExtService,
        private translate: TranslateService
    ) {
        this.shouldRedirect = this.dialogData?.shouldRedirect;
        this.refererURL = this.dialogData?.refererURL;
        this.isDeleting = false;
        this.documents = this.dialogData?.documents ?? [];
        this.populateDialogTitleAndDescription();
        this.deleteDocument$ = from(this.documents).pipe(
            filter((document: Document) => !!document?.sys_id),
            mergeMap((document: Document) =>
                this.documentService.deleteDocument(document.sys_id as string).pipe(
                    map((docId) => ({
                        success: true,
                        docId,
                    })),
                    catchError((error) =>
                        of({
                            success: false,
                            error: error,
                            docId: document.sys_id as string,
                        })
                    )
                )
            ),
            toArray()
        );
    }

    protected onDelete() {
        this.isDeleting = true;
        this.deleteDocument$.subscribe({
            next: (results: ContentDeletedDialogResponse[]) => {
                this.processDeletionResultsAndNotify(results);
            },
            error: () => {
                this.displayNotificationMessage('DOCUMENT_DELETE.SNACKBAR.DELETE.ERROR', DeletedStatus.ERROR);
            },
            complete: () => {
                this.isDeleting = false;
                this.dialogRef.close();
                if (this.shouldRedirect) {
                    this.redirectToReferer();
                }
            },
        });
    }

    private redirectToReferer(): void {
        this.routerExtService.redirectToReferer(this.refererURL, this.documentRouterService.urlForParent(this.documents[0]));
    }

    private processDeletionResultsAndNotify(results: ContentDeletedDialogResponse[]) {
        const successCount = results.filter((res) => res.success).length;
        const errorCount = results.length - successCount;
        const messages = [];

        if (successCount > 0) {
            const successMessageKey =
                successCount === 1
                    ? deleteItemNotificationMessages[DeletedStatus.SUCCESS].SINGLE
                    : deleteItemNotificationMessages[DeletedStatus.SUCCESS].MULTI;

            messages.push(this.translate.instant(successMessageKey).replace('{count}', successCount.toString()));
        }

        if (errorCount > 0) {
            const errorMessageKey =
                errorCount === 1
                    ? deleteItemNotificationMessages[DeletedStatus.ERROR].SINGLE
                    : deleteItemNotificationMessages[DeletedStatus.ERROR].MULTI;

            messages.push(this.translate.instant(errorMessageKey).replace('{count}', errorCount.toString()));
        }

        const finalMessage = messages.join(' ');
        let status;
        if (successCount > 0 && errorCount > 0) {
            status = DeletedStatus.REQUEST;
        } else if (successCount > 0) {
            status = DeletedStatus.SUCCESS;
        } else {
            status = DeletedStatus.ERROR;
        }

        if (finalMessage) {
            this.displayNotificationMessage(finalMessage, status);
        }
    }

    private displayNotificationMessage(message: string, status: DeletedStatus) {
        this.hxpNotificationService.openSnackBar(message, deleteSnackBarTypes[status]);
    }

    private populateDialogTitleAndDescription() {
        this.dialogTitle =
            this.documents.length > 1 ? 'DOCUMENT_DELETE.APP.DIALOGS.DELETE.MULTIPLE_ITEMS.TITLE' : 'DOCUMENT_DELETE.APP.DIALOGS.DELETE.ITEM.TITLE';
        this.dialogDescription =
            this.documents.length > 1
                ? 'DOCUMENT_DELETE.APP.DIALOGS.DELETE.MULTIPLE_ITEMS.DESCRIPTION'
                : 'DOCUMENT_DELETE.APP.DIALOGS.DELETE.ITEM.DESCRIPTION';
    }
}
