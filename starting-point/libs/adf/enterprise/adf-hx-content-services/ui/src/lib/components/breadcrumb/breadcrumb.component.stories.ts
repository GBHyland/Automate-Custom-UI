/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { HxpBreadcrumbComponent } from './breadcrumb.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { I18nModule } from '../../configs/storybook/i18n.module';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { of } from 'rxjs';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { importProvidersFrom } from '@angular/core';

const documents: Record<string, any> = {
    ROOT_DOCUMENT: ROOT_DOCUMENT,
    Document1: mocks.nestedDocument,
    Document2: mocks.nestedDocumentAncestors2[0],
};

export default {
    title: 'Ui/Breadcrumbs/Breadcrumb With Path Builder',
    component: HxpBreadcrumbComponent,
    decorators: [
        applicationConfig({
            providers: [importProvidersFrom(I18nModule)],
        }),
        moduleMetadata({
            imports: [RouterTestingModule],
            providers: [
                {
                    provide: DocumentService,
                    useValue: {
                        getAncestors: (id: string) => {
                            if (id === mocks.nestedDocument.sys_id) {
                                return of([ROOT_DOCUMENT, ...mocks.nestedDocumentAncestors]);
                            }
                            if (id === mocks.nestedDocumentAncestors2[0].sys_id) {
                                return of([ROOT_DOCUMENT, ...mocks.nestedDocumentAncestors, ...mocks.nestedDocumentAncestors2]);
                            }
                            return of([ROOT_DOCUMENT]);
                        },
                    },
                },
            ],
        }),
    ],
    argTypes: {
        document: {
            options: Object.keys(documents),
            control: {
                type: 'select',
            },
            mapping: documents,
        },
    },
} as Meta<HxpBreadcrumbComponent>;

export const BreadcrumbWithPathBuilder = {
    render: (args: HxpBreadcrumbComponent) => ({
        props: args,
    }),
    args: {
        document: documents['Document1'],
    },
};

export const Compacted = {
    render: (args: HxpBreadcrumbComponent) => ({
        props: args,
    }),
    args: {
        document: documents['Document2'],
        compact: true,
    },
};
