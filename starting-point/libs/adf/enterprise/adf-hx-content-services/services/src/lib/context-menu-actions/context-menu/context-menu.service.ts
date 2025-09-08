/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DocumentActionService } from '../../context-menu-actions/actions/document-action.service';
import {
    HXP_DOCUMENT_COPY_ACTION_SERVICE,
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_MOVE_ACTION_SERVICE,
    HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    HXP_DOCUMENT_REPLACE_FILE_ACTION_SERVICE,
    HXP_DOCUMENT_CREATE_DOCUMENT_VERSION_ACTION_SERVICE,
} from '../../context-menu-actions/actions/action.tokens';
import { ActionContext } from '../../context-menu-actions/actions/action-context.interface';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';
import { ManageVersionsButtonActionService } from '../../manage-versions/manage-versions-button/manage-versions-button-action.service';

export interface ContextActionConfiguration {
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
export class ContextMenuActionsService {
    private isVersioningFlagOn = false;

    constructor(
        @Inject(HXP_DOCUMENT_DELETE_ACTION_SERVICE)
        private documentDeleteHandler: DocumentActionService,
        @Inject(HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE)
        private documentPermissionsHandler: DocumentActionService,
        @Inject(HXP_DOCUMENT_SHARE_ACTION_SERVICE)
        private documentShareHandler: DocumentActionService,
        @Inject(HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE)
        private documentSingleItemDownloadHandler: DocumentActionService,
        @Inject(HXP_DOCUMENT_INFO_ACTION_SERVICE)
        private documentInfoHandler: DocumentActionService,
        @Inject(FeaturesServiceToken)
        private featuresService: IFeaturesService,
        // copy and move actions are still declared under workspace-hxp.
        // Customer devs have to implement their own implementations since those actions are outside the lib.
        // We can't be sure that an implementation is provided so we marked them as @Optional.
        @Optional()
        @Inject(HXP_DOCUMENT_COPY_ACTION_SERVICE)
        private documentCopyHandler?: DocumentActionService,
        @Optional()
        @Inject(HXP_DOCUMENT_MOVE_ACTION_SERVICE)
        private documentMoveHandler?: DocumentActionService,
        @Optional()
        @Inject(HXP_DOCUMENT_REPLACE_FILE_ACTION_SERVICE)
        private replaceFileHander?: DocumentActionService,
        @Optional()
        @Inject(HXP_DOCUMENT_CREATE_DOCUMENT_VERSION_ACTION_SERVICE)
        private createVersionHander?: DocumentActionService,
        private manageVersionsHandler?: ManageVersionsButtonActionService
    ) {
        this.featuresService.isOn$(ADF_HX_CONTENT_SERVICES_INTERNAL.WORKSPACE_VERSIONING).subscribe((isOn) => {
            this.isVersioningFlagOn = isOn;
        });
    }

    getContextActions(data: Document, parentDocument?: Document): ContextActionConfiguration[] {
        const context: ActionContext = {
            documents: [data],
            parentDocument,
            showPanel: 'property',
        };

        const actions = [
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
            {
                data,
                model: {
                    key: 'delete',
                    icon: 'delete',
                    title: 'DOCUMENT_DELETE.APP.TOOLBAR.BUTTONS.DELETE.TITLE',
                    visible: this.documentDeleteHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.documentDeleteHandler, context),
            },
        ];
        if (this.documentCopyHandler) {
            actions.push({
                data,
                model: {
                    key: 'copy',
                    icon: 'content_copy',
                    title: 'APP.TOOLBAR.BUTTONS.COPY.TITLE',
                    visible: this.documentCopyHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.documentCopyHandler, context),
            });
        }
        if (this.documentMoveHandler) {
            actions.push({
                data,
                model: {
                    key: 'move',
                    icon: 'open_with',
                    title: 'APP.TOOLBAR.BUTTONS.MOVE.TITLE',
                    visible: this.documentMoveHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.documentMoveHandler, context),
            });
        }
        actions.push(
            {
                data,
                model: {
                    key: 'permissions-management',
                    icon: 'group',
                    title: 'APP.TOOLBAR.BUTTONS.PERMISSIONS_MANAGEMENT.TITLE',
                    visible: this.documentPermissionsHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.documentPermissionsHandler, context),
            },
            {
                data,
                model: {
                    key: 'doc-info',
                    icon: 'info',
                    title: 'APP.TOOLBAR.BUTTONS.INFO.TITLE',
                    visible: this.documentInfoHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.documentInfoHandler, context),
            }
        );
        if (this.replaceFileHander) {
            actions.push({
                data,
                model: {
                    key: 'replace',
                    icon: 'file_upload',
                    title: 'APP.TOOLBAR.BUTTONS.REPLACE_FILE.TITLE',
                    visible: this.isVersioningFlagOn && this.replaceFileHander.isAvailable(context),
                },
                subject: this.toContextAction(this.replaceFileHander, context),
            });
        }
        if (this.createVersionHander) {
            actions.push({
                data,
                model: {
                    key: 'version',
                    icon: 'save',
                    title: 'APP.TOOLBAR.BUTTONS.DOCUMENT_VERSION.TITLE',
                    visible: this.isVersioningFlagOn && this.createVersionHander.isAvailable(context),
                },
                subject: this.toContextAction(this.createVersionHander, context),
            });
        }
        if (this.manageVersionsHandler) {
            actions.push({
                data,
                model: {
                    key: 'manage-versions',
                    icon: 'query_builder',
                    title: 'MANAGE_VERSIONS.TOOLBAR.BUTTONS.VERSIONS.TITLE',
                    visible: this.isVersioningFlagOn && this.manageVersionsHandler.isAvailable(context),
                },
                subject: this.toContextAction(this.manageVersionsHandler, { ...context, showPanel: 'version' }),
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
