/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Document } from '@hylandsoftware/hxcs-js-client';
import {
    DocumentActionService,
    HXP_DOCUMENT_VERSION_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_VERSION_EDIT_ACTION_SERVICE,
    HXP_DOCUMENT_RESTORE_VERSION_ACTION_SERVICE,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
    ActionContext,
} from '@alfresco/adf-hx-content-services/services';

export interface VersionContextActionConfiguration {
    data: Document;
    model: {
        key: string;
        icon: string;
        title: string;
        visible: boolean;
    };
    subject: Subject<any>;
}

@Injectable({
    providedIn: 'root',
})
export class VersionContextMenuActionsService {
    constructor(
        @Inject(HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE)
        private documentSingleItemDownloadHandler: DocumentActionService,
        @Inject(HXP_DOCUMENT_SHARE_ACTION_SERVICE)
        private documentShareHandler: DocumentActionService,
        @Inject(HXP_DOCUMENT_RESTORE_VERSION_ACTION_SERVICE)
        private documentVersionRestoreHandler?: DocumentActionService,
        @Inject(HXP_DOCUMENT_VERSION_EDIT_ACTION_SERVICE)
        private documentVersionEditHandler?: DocumentActionService,
        @Inject(HXP_DOCUMENT_VERSION_DELETE_ACTION_SERVICE)
        private documentVersionDeleteHandler?: DocumentActionService
    ) {}

    getVersionContextActions(data: Document, parentDocument?: Document): VersionContextActionConfiguration[] {
        const context: ActionContext = {
            documents: [data],
            parentDocument,
            showPanel: 'version',
        };
        const actions: VersionContextActionConfiguration[] = [
            {
                data,
                model: {
                    key: 'download',
                    icon: 'download',
                    title: 'SINGLE_FILE_DOWNLOAD.TOOLBAR.BUTTONS.DOWNLOAD.TITLE',
                    visible: this.documentSingleItemDownloadHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.documentSingleItemDownloadHandler, context),
            },
            {
                data,
                model: {
                    key: 'share',
                    icon: 'share',
                    title: 'DOCUMENT_SHARE.TOOLBAR.BUTTONS.SHARE.TITLE',
                    visible: this.documentShareHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.documentShareHandler, context),
            },
        ];

        if (this.documentVersionRestoreHandler) {
            actions.push({
                data,
                model: {
                    key: 'restore-version',
                    icon: 'history',
                    title: 'RESTORE_VERSION.TOOLBAR.BUTTONS.RESTORE.TITLE',
                    visible: this.documentVersionRestoreHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.documentVersionRestoreHandler, context),
            });
        }
        if (this.documentVersionEditHandler) {
            actions.push({
                data,
                model: {
                    key: 'edit-version',
                    icon: 'edit',
                    title: 'MANAGE_VERSIONS.DIALOG.MORE_MENU.EDIT',
                    visible: this.documentVersionEditHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.documentVersionEditHandler, context),
            });
        }
        if (this.documentVersionDeleteHandler) {
            actions.push({
                data,
                model: {
                    key: 'delete-version',
                    icon: 'delete',
                    title: 'MANAGE_VERSIONS.DIALOG.MORE_MENU.DELETE',
                    visible: this.documentVersionDeleteHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.documentVersionDeleteHandler, context),
            });
        }

        return actions;
    }

    private toContextAction(documentActionService: DocumentActionService, context: ActionContext): Subject<void> {
        const subject = new Subject<void>();
        subject.subscribe({
            next: () => {
                documentActionService.execute(context);
            },
        });
        return subject;
    }
}
