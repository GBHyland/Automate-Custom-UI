/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ClipboardService,
    DecimalNumberPipe,
    FileSizePipe,
    INFO_DRAWER_DIRECTIVES,
    LocalizedDatePipe,
    NotificationService,
    UserPreferencesService,
} from '@alfresco/adf-core';
import { FieldType, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { DOCUMENT_PROPERTIES_SERVICE, DOCUMENT_SERVICE, DocumentService } from '@alfresco/adf-hx-content-services/services';
import { AsyncPipe } from '@angular/common';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { I18nModule } from '../../configs/storybook/i18n.module';
import { defaultPropertiesMock, ExtendedCardViewItem } from '../../configs/storybook/properties-management.mock';
import { HxpPropertiesSidebarComponent } from './hxp-properties-sidebar.component';

const documentWithOtherProperties: Partial<Document> = {
    sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af86',
    sys_mixinTypes: ['SysFilish'],
    sys_name: 'File 2',
    sys_path: '/File 2',
    sys_title: 'File 2',
    sys_contributors: [
        {
            id: '444660e7-0334-4356-8c3d-484fe445b610',
            firstName: 'test2',
            lastName: 'user2',
        },
    ],
    sys_created: '2022-12-14T11:46:58.892+00:00',
    sys_creator: {
        id: '444660e7-0334-4356-8c3d-484fe445b610',
        firstName: 'test2',
        lastName: 'user2',
    },
    sys_description: 'File 1 description',
    sys_lastContributor: {
        id: '444660e7-0334-4356-8c3d-484fe445b610',
        firstName: 'test2',
        lastName: 'user2',
    },
    sys_modified: '2022-12-14T11:46:58.892+00:00',
    sysfile_blob: { filename: 'some_path.txt', mimeType: 'text/plain' },
};

const documentWithOtherPropertiesCardViewItemsMock: ExtendedCardViewItem[] = [
    {
        label: 'Title',
        value: 'File 2',
        key: 'sys_title',
        type: 'text',
        displayValue: 'File 2',
        isEmpty: () => false,
    },
    {
        label: 'Filename',
        value: 'test.pdf',
        key: 'sysfile_blob.filename',
        type: 'text',
        displayValue: 'test.pdf',
        isEmpty: () => false,
    },
    {
        label: 'Created',
        value: '2024-10-14T11:46:58.892+00:00',
        key: 'sys_created',
        type: 'date',
        displayValue: 'Oct 10, 2024',
        isEmpty: () => false,
    },
    {
        label: 'LastModified',
        value: '2024-10-14T11:46:58.892+00:00',
        key: 'sys_modified',
        type: 'date',
        displayValue: 'Oct 10, 2024',
        isEmpty: () => false,
    },
    {
        label: 'Creator',
        value: 'user3',
        key: 'sys_creator',
        type: 'text',
        displayValue: 'user3',
        isEmpty: () => false,
    },
    {
        label: 'Last Contributor',
        value: 'user3',
        key: 'sys_lastContributor',
        type: 'text',
        displayValue: 'user3',
        isEmpty: () => false,
    },
    {
        label: 'Mime Type',
        value: 'application/pdf',
        key: 'sysfile_blob.mimeType',
        type: 'text',
        displayValue: 'application/pdf',
        isEmpty: () => false,
    },
];

const otherPropertiesCardViewItems: ExtendedCardViewItem[] = [
    {
        label: 'Test String',
        value: 'test string',
        key: 'test_string',
        type: 'text',
        displayValue: 'Test String',
        isEmpty: () => false,
    },
    {
        label: 'Test Boolean',
        value: false,
        key: 'test_boolean',
        type: 'boolean',
        displayValue: 'Test boolean',
        isEmpty: () => false,
    },
];

const document: Record<string, Partial<Document>> = {
    'Document with default properties': mocks.fileDocument,
    'Document with default and other properties': documentWithOtherProperties,
};

const documentPropertiesServiceMock = {
    getRequiredProperties: () => {
        return ['sys_title', 'sysfile_blob.filename'];
    },
    propertyType: () => {
        return FieldType.String;
    },
    extractCustomSchemaFields: () => {
        return of();
    },
    getDefaultPropertiesFromDocument: (doc: Document) => {
        if (doc.sys_id === mocks.fileDocument.sys_id) {
            return of(defaultPropertiesMock);
        }
        if (doc.sys_id === documentWithOtherProperties.sys_id) {
            return of(documentWithOtherPropertiesCardViewItemsMock);
        }
        return of();
    },
    getPropertiesFromDocument: (doc: Document) => {
        if (doc.sys_id === documentWithOtherProperties.sys_id) {
            return of(otherPropertiesCardViewItems);
        }
        return of();
    },
};

export default {
    title: 'Ui/Properties Management/Sidebar',
    component: HxpPropertiesSidebarComponent,
    decorators: [
        applicationConfig({
            providers: [
                MatSnackBar,
                importProvidersFrom(I18nModule),
                provideAnimations(),
                mockHxcsJsClientConfigurationService,
                MockProvider(UserPreferencesService, {
                    select: () => of('en') as any,
                }),
                MockProvider(DecimalNumberPipe),
                MockProvider(AsyncPipe),
                MockProvider(LocalizedDatePipe),
                MockProvider(FileSizePipe),
                {
                    provide: DOCUMENT_PROPERTIES_SERVICE,
                    useValue: documentPropertiesServiceMock,
                },
                {
                    provide: DocumentService,
                    useValue: {
                        documentUpdated$: of(),
                        getDocumentById: (docId: string) => {
                            if (docId === documentWithOtherProperties.sys_id) {
                                return of(documentWithOtherProperties);
                            }
                            return of(mocks.fileDocument);
                        },
                    },
                },
            ],
        }),
        moduleMetadata({
            imports: [...INFO_DRAWER_DIRECTIVES],
            providers: [
                ClipboardService,
                NotificationService,
                {
                    provide: DOCUMENT_SERVICE,
                    useValue: {
                        updateDocument: (_documentId: string, updatedProperties: { [key: string]: any }) => {
                            return of({ ...mocks.fileDocument, ...updatedProperties });
                        },
                    },
                },
            ],
        }),
    ],
    argTypes: {
        document: {
            options: Object.keys(document),
            control: {
                type: 'select',
            },
            mapping: document,
        },
    },
} as Meta<HxpPropertiesSidebarComponent>;

export const DefaultProperties = {
    render: (args: HxpPropertiesSidebarComponent) => ({
        props: args,
    }),
    args: {
        document: document['Document with default properties'],
        editable: false,
    },
};

export const DefaultAndOtherProperties = {
    render: (args: HxpPropertiesSidebarComponent) => ({
        props: args,
    }),
    args: {
        document: document['Document with default and other properties'],
        editable: false,
    },
};

export const EditableProperties = {
    render: (args: HxpPropertiesSidebarComponent) => ({
        props: args,
    }),
    args: {
        document: document['Document with default properties'],
    },
};
