/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserPreferencesService } from '@alfresco/adf-core';
import {
    copyApiProvider,
    documentApiProvider,
    mockHxcsJsClientConfigurationService,
    moveApiProvider,
    queryApiProvider,
} from '@alfresco/adf-hx-content-services/api';
import { DocumentService, HXP_DOCUMENT_DELETE_ACTION_SERVICE, RouterExtService } from '@alfresco/adf-hx-content-services/services';
import { importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { MockProvider } from 'ng-mocks';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { I18nModule } from '../../../../configs/storybook/i18n.module';
import { DeleteButtonActionService } from './content-delete-button-action.service';
import { ContentDeleteButtonComponent } from './content-delete-button.component';
import { provideRouter } from '@angular/router';

const { sys_effectivePermissions, sys_id, sys_title } = mocks.fileDocument;

const deletableDocument: Partial<Document> = {
    sys_id,
    sys_title,
    sys_effectivePermissions,
};

export default {
    title: 'Ui/Actions/Delete Button',
    component: ContentDeleteButtonComponent,
    decorators: [
        applicationConfig({
            providers: [
                mockHxcsJsClientConfigurationService,
                documentApiProvider,
                queryApiProvider,
                copyApiProvider,
                moveApiProvider,
                importProvidersFrom([I18nModule, MatSnackBarModule]),
                provideRouter([]),
                provideAnimations(),
                MockProvider(UserPreferencesService, {
                    select: () => of('ltr') as any,
                }),
                MockProvider(DocumentService, {
                    deleteDocument: (docId: string) =>
                        docId === 'remote-error-id' ? throwError('500 fake remote error') : of(docId).pipe(delay(1000)),
                    documentUpdated$: new Observable(),
                }),
                MockProvider(RouterExtService, {
                    redirectToReferer: (_refererURL: string, defaultPath: string) => {
                        alert(`Browser would redirect to the parent Document URL: ${defaultPath}`);
                    },
                }),
            ],
        }),
        moduleMetadata({
            imports: [MatDialogModule],
            providers: [
                {
                    provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE,
                    useClass: DeleteButtonActionService,
                },
            ],
        }),
    ],
} as Meta<ContentDeleteButtonComponent>;

export const Success = {
    render: (args: ContentDeleteButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: {
            documents: [deletableDocument],
            parentDocument: mocks.folderDocument,
            shouldRedirect: false,
        },
    },
};

export const SuccessWithUrlRedirect = {
    render: (args: ContentDeleteButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: {
            documents: [deletableDocument],
            parentDocument: mocks.folderDocument,
            shouldRedirect: true,
        },
    },
};

export const Error = {
    render: (args: ContentDeleteButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: {
            documents: [{ ...deletableDocument, sys_id: 'remote-error-id', sys_title: 'File to delete' }],
            parentDocument: mocks.folderDocument,
            shouldRedirect: false,
        },
    },
};

export const DisabledBecauseDeletePermissionIsMissing = {
    render: (args: ContentDeleteButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [{ ...deletableDocument, sys_effectivePermissions: ['Read'] }] },
        parentDocument: mocks.folderDocument,
        shouldRedirect: false,
    },
};

export const DisabledBecauseDeleteChildPermissionIsMissingFromTheParentDocument = {
    render: (args: ContentDeleteButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [deletableDocument] },
        parentDocument: { ...mocks.folderDocument, sys_effectivePermissions: ['Read'] },
        shouldRedirect: false,
    },
};
