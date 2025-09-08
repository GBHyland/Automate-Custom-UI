/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { switchMap } from 'rxjs';
import { Document } from '@hylandsoftware/hxcs-js-client';
import {
    HxpNotificationService,
    ActionContext,
    DocumentActionService,
    DocumentPermissions,
    hasPermission,
    isFile,
    isVersion,
} from '@alfresco/adf-hx-content-services/services';
import { FileModel } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import {
    UploadContentModel,
    UploadManagerService,
    UploadSnackbarService,
} from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { UpdateDocumentBlobActionStrategy } from './update-document-blob-action-strategy';

@Injectable({
    providedIn: 'root',
})
export class ReplaceFileButtonComponentActionService implements DocumentActionService {
    private notificationService = inject(HxpNotificationService);
    private uploadManagerService = inject(UploadManagerService);
    private updateDocumentBlobActionStrategy = inject(UpdateDocumentBlobActionStrategy);
    private uploadSnackbarService = inject(UploadSnackbarService);

    readonly acceptedFilesTypes: string = '*';

    isAvailable(context: ActionContext): boolean {
        if (context.documents.length !== 1) {
            return false;
        }

        const document = context.documents[0];
        return document && isFile(document) && hasPermission(document, DocumentPermissions.WRITE) && !isVersion(document);
    }

    execute(context: ActionContext): void {
        const document = context.documents[0];
        this.triggerFileSelection((event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];
                const fileModel: FileModel = new FileModel(file, {
                    parentId: document.sys_id,
                    path: ((file as any).webkitRelativePath || '').replace(/\/[^/]*$/, ''),
                });
                this.replaceFile(fileModel, document);
            }
        });
    }

    private triggerFileSelection(selectionCallback: (event: Event) => void): void {
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = this.acceptedFilesTypes;
        input.style.display = 'none';

        input.addEventListener('change', selectionCallback);

        window.document.body.append(input);
        input.click();
        input.remove();
    }

    private replaceFile(fileModel: FileModel, document: Document): void {
        const uploadModel: UploadContentModel = this.uploadManagerService.createUploadModel(fileModel, this.updateDocumentBlobActionStrategy, {
            document,
        });
        this.uploadManagerService.addToQueue(uploadModel);

        this.uploadManagerService
            .initiateUpload(uploadModel)
            .pipe(switchMap(() => this.uploadManagerService.completeUpload(uploadModel)))
            .subscribe({
                next: () => this.notificationService.showSuccess('REPLACE_FILE.SUCCESS'),
                error: () => this.notificationService.showError('REPLACE_FILE.ERROR'),
            });
        this.uploadSnackbarService.requestMaximize();
    }
}
