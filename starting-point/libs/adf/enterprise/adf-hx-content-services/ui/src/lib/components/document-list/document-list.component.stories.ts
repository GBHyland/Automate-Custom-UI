/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { HxpDocumentListComponent } from './document-list.component';
import {
    provideAdfEnterpriseAdfHxContentServicesServices,
    ContextMenuActionsService,
    DocumentCacheService,
    DocumentService,
    IsSingleDocumentWithMainBlobService,
} from '@alfresco/adf-hx-content-services/services';
import { RouterTestingModule } from '@angular/router/testing';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { I18nModule } from '../../configs/storybook/i18n.module';
import { Observable, of } from 'rxjs';
import { ObjectDataColumn, ThumbnailService as AdfThumbnailService } from '@alfresco/adf-core';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { importProvidersFrom } from '@angular/core';
import { ThumbnailService } from '@alfresco/adf-hx-content-services/icons';
import { Document } from '@hylandsoftware/hxcs-js-client';

const folderIcon = './assets/images/Folder.svg';
const fileIcon = './assets/images/PDF.svg';

const rootDoc = { ...ROOT_DOCUMENT, sys_title: 'Home', sys_modified: '2020-11-04T11:46:58.892+00:00', icon: folderIcon };
const file = { ...mocks.fileDocument, icon: fileIcon };
const folder = { ...mocks.folderDocument, icon: folderIcon };
const nestedDocument = { ...mocks.nestedDocumentAncestors[1], icon: folderIcon };

const documentList: Record<string, Document[]> = {
    Home: [rootDoc],
    'Folder and file': [folder, file],
    'Nested folder with folder and file': [nestedDocument, folder, file],
};

export default {
    title: 'Ui/Core/Document List',
    component: HxpDocumentListComponent,
    decorators: [
        applicationConfig({
            providers: [importProvidersFrom(I18nModule), provideAdfEnterpriseAdfHxContentServicesServices()],
        }),
        moduleMetadata({
            imports: [RouterTestingModule],
            providers: [
                {
                    provide: ContextMenuActionsService,
                    useValue: {
                        getContextActions: () => {},
                    },
                },
                IsSingleDocumentWithMainBlobService,
                {
                    provide: DocumentCacheService,
                    useValue: {
                        getDocument: (id: string) => {
                            let cachedDocument: Observable<Document>;

                            switch (id) {
                                case folder.sys_id: {
                                    cachedDocument = of(folder);
                                    break;
                                }
                                case file.sys_id: {
                                    cachedDocument = of(file);
                                    break;
                                }
                                case nestedDocument.sys_id: {
                                    cachedDocument = of(nestedDocument);
                                    break;
                                }
                                default: {
                                    cachedDocument = of(ROOT_DOCUMENT);
                                    break;
                                }
                            }
                            return cachedDocument;
                        },
                    },
                },
                {
                    provide: DocumentService,
                    useValue: {},
                },
                { provide: AdfThumbnailService, useClass: ThumbnailService },
            ],
        }),
    ],
    argTypes: {
        documents: {
            options: Object.keys(documentList),
            control: {
                type: 'select',
            },
            mapping: documentList,
        },
    },
} as Meta<HxpDocumentListComponent>;

export const Default = {
    render: (args: HxpDocumentListComponent) => ({
        props: args,
    }),
    args: {
        documents: documentList['Home'],
        schema: [
            new ObjectDataColumn({
                key: 'icon',
                type: 'image',
                title: 'Icon',
                sortable: false,
            }),
            new ObjectDataColumn({
                key: 'sys_title',
                type: 'text',
                title: 'DOCUMENT_LIST.COLUMNS.TITLE',
                sortable: true,
            }),
            new ObjectDataColumn({
                key: 'sys_modified',
                type: 'date',
                title: 'DOCUMENT_LIST.COLUMNS.LAST_MODIFIED.LABEL',
                sortable: true,
            }),
        ],
    },
};

export const Loading = {
    render: (args: HxpDocumentListComponent) => ({
        props: args,
    }),
    args: {
        documents: [],
        isLoading: true,
    },
};
