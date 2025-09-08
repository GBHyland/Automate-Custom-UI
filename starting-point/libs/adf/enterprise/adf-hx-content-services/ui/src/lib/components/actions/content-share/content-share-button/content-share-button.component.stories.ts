/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentPermissions, HXP_DOCUMENT_SHARE_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { I18nModule } from '../../../../configs/storybook/i18n.module';
import { ContentShareButtonActionService } from './content-share-button-action.service';
import { ContentShareButtonComponent } from './content-share-button.component';
import { provideRouter } from '@angular/router';

const { sys_id, sys_title } = mocks.fileDocument;

const sharableContent: Partial<Document> = {
    sys_id,
    sys_title,
    sys_effectivePermissions: [DocumentPermissions.READ],
};

export default {
    title: 'Ui/Actions/Share Button',
    component: ContentShareButtonComponent,
    decorators: [
        applicationConfig({
            providers: [provideRouter([]), importProvidersFrom([I18nModule, MatSnackBarModule]), provideAnimations()],
        }),
        moduleMetadata({
            imports: [MatDialogModule],
            providers: [{ provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE, useClass: ContentShareButtonActionService }],
        }),
    ],
} as Meta<ContentShareButtonComponent>;

export const Enabled = {
    render: (args: ContentShareButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [sharableContent] },
    },
};

export const Disabled = {
    render: (args: ContentShareButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [{ ...sharableContent, sys_effectivePermissions: [] }] },
    },
};
