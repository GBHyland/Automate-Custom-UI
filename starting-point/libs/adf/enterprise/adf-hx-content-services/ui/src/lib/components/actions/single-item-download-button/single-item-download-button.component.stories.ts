/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserPreferencesService } from '@alfresco/adf-core';
import { downloadApiProvider, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import {
    DownloadStatus,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    SingleFileDownloadService,
} from '@alfresco/adf-hx-content-services/services';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { MockProvider } from 'ng-mocks';
import { BehaviorSubject, of } from 'rxjs';
import { delay, take, tap } from 'rxjs/operators';
import { I18nModule } from '../../../configs/storybook/i18n.module';
import { SingleItemDownloadButtonComponent } from './single-item-download-button.component';
import { SingleItemDownloadButtonActionService } from './single-item-download-button-action.service';

const { sys_effectivePermissions, sysfile_blob, sys_id, sys_title } = mocks.fileDocument;

const downloadableDocument: Partial<Document> = {
    sys_id,
    sys_title,
    sysfile_blob,
    sys_effectivePermissions,
};

export default {
    title: 'Ui/Actions/Download Button',
    component: SingleItemDownloadButtonComponent,
    decorators: [
        applicationConfig({
            providers: [
                importProvidersFrom([I18nModule, MatSnackBarModule]),
                mockHxcsJsClientConfigurationService,
                downloadApiProvider,
                provideAnimations(),
                MockProvider(UserPreferencesService, {
                    select: () => of('ltr') as any,
                }),
                {
                    provide: SingleFileDownloadService,
                    useValue: {
                        download: (document: Document) => {
                            const downloadStatusSubject: BehaviorSubject<DownloadStatus> = new BehaviorSubject<DownloadStatus>(
                                DownloadStatus.REQUEST
                            );
                            downloadStatusSubject.next(document.sys_id === 'failing-file-id' ? DownloadStatus.ERROR : DownloadStatus.SUCCESS);
                            return downloadStatusSubject.asObservable().pipe(
                                take(1),
                                delay(500),
                                tap(() => downloadStatusSubject.complete())
                            );
                        },
                    },
                },
            ],
        }),
        moduleMetadata({
            providers: [
                {
                    provide: HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
                    useClass: SingleItemDownloadButtonActionService,
                },
            ],
        }),
    ],
} as Meta<SingleItemDownloadButtonComponent>;

export const Success = {
    render: (args: SingleItemDownloadButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [downloadableDocument] },
    },
};

export const Error = {
    render: (args: SingleItemDownloadButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [{ ...downloadableDocument, sys_id: 'failing-file-id', sys_title: 'Corrupted File' }] },
    },
};

export const DisabledBecauseReadPermissionIsMissing = {
    render: (args: SingleItemDownloadButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [{ ...downloadableDocument, sys_effectivePermissions: [] }] },
    },
};

export const DisabledBecauseThereIsNoBlobToDownload = {
    render: (args: SingleItemDownloadButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [{ ...downloadableDocument, sysfile_blob: undefined }] },
    },
};
