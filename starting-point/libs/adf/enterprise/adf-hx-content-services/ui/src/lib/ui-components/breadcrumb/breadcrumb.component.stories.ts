/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { importProvidersFrom } from '@angular/core';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { I18nModule } from '../../configs/storybook/i18n.module';
import { HxpUiBreadcrumbComponent } from './breadcrumb.component';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DocumentRouterPipe } from './pipes/document-router.pipe';
import { Document } from '@hylandsoftware/hxcs-js-client';

const documents: Record<string, Document[]> = {
    Home: [ROOT_DOCUMENT],
    'Folder and file': [ROOT_DOCUMENT, mocks.folderDocument, mocks.fileDocument],
    'Nested folder with file': [ROOT_DOCUMENT, mocks.nestedDocument, mocks.fileDocument],
    'Very long path': [ROOT_DOCUMENT, ...mocks.nestedDocumentAncestors, ...mocks.nestedDocumentAncestors2],
};

export default {
    title: 'Ui/Breadcrumbs/Simple Breadcrumb',
    component: HxpUiBreadcrumbComponent,
    decorators: [
        applicationConfig({
            providers: [importProvidersFrom(I18nModule)],
        }),
        moduleMetadata({
            imports: [HxpUiBreadcrumbComponent, RouterTestingModule, DocumentRouterPipe],
        }),
    ],
    argTypes: {
        documents: {
            options: Object.keys(documents),
            control: {
                type: 'select',
            },
            mapping: documents,
        },
    },
} as Meta<HxpUiBreadcrumbComponent>;

export const SimpleBreadcrumb = {
    render: (args: HxpUiBreadcrumbComponent) => ({
        props: args,
    }),
    args: {
        documents: documents['Home'],
    },
};

export const Compacted = {
    render: (args: HxpUiBreadcrumbComponent) => ({
        props: args,
    }),
    args: {
        documents: documents['Very long path'],
        compact: true,
    },
};
