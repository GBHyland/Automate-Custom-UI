/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DOWNLOAD_API_TOKEN, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import {
    DocumentService,
    HXP_DOCUMENT_COPY_ACTION_SERVICE,
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    HXP_DOCUMENT_MOVE_ACTION_SERVICE,
    HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
} from '@alfresco/adf-hx-content-services/services';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Document, DownloadApi } from '@hylandsoftware/hxcs-js-client';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { of } from 'rxjs';
import { I18nModule } from '../../configs/storybook/i18n.module';
import { HxpDocumentTreeComponent } from './hxp-document-tree.component';

const isAvailableService = (availability: boolean) => ({ isAvailable: () => availability });

const documents: Partial<Document>[] = [
    ROOT_DOCUMENT,
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af83',
        sys_title: 'Folder1',
        sys_isFolderish: true,
        sys_primaryType: 'SysFolder',
        sys_path: '/Folder1',
        sys_parentId: '00000000-0000-0000-0000-000000000000',
    },
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af84',
        sys_title: 'Folder2',
        sys_isFolderish: true,
        sys_primaryType: 'SysFolder',
        sys_path: '/Folder1/Folder2',
        sys_parentId: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af83',
    },
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af85',
        sys_title: 'Folder3',
        sys_isFolderish: true,
        sys_primaryType: 'SysFolder',
        sys_path: '/Folder1/Folder2/Folder3',
        sys_parentId: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af84',
    },
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af86',
        sys_title: 'Folder4',
        sys_isFolderish: true,
        sys_primaryType: 'SysFolder',
        sys_path: '/Folder1/Folder2/Folder4',
        sys_parentId: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af84',
    },
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af87',
        sys_title: 'Folder5',
        sys_isFolderish: true,
        sys_primaryType: 'SysFolder',
        sys_path: '/Folder1/Folder2/Folder3/Folder5',
        sys_parentId: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af85',
    },
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af88',
        sys_title: 'Folder6',
        sys_isFolderish: true,
        sys_primaryType: 'SysFolder',
        sys_path: '/Folder1/Folder2/Folder4/Folder6',
        sys_parentId: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af86',
    },
];

export default {
    title: 'Ui/Core/Document Tree',
    component: HxpDocumentTreeComponent,
    decorators: [
        applicationConfig({
            providers: [importProvidersFrom([I18nModule, MatSnackBarModule]), { provide: DOWNLOAD_API_TOKEN, useClass: DownloadApi }],
        }),
        moduleMetadata({
            imports: [HxpDocumentTreeComponent],
            providers: [
                { provide: HXP_DOCUMENT_COPY_ACTION_SERVICE, useValue: isAvailableService(true) },
                { provide: HXP_DOCUMENT_MOVE_ACTION_SERVICE, useValue: isAvailableService(true) },
                { provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE, useValue: isAvailableService(true) },
                { provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE, useValue: isAvailableService(true) },
                {
                    provide: HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
                    useValue: isAvailableService(true),
                },
                {
                    provide: HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
                    useValue: isAvailableService(true),
                },
                { provide: HXP_DOCUMENT_INFO_ACTION_SERVICE, useValue: isAvailableService(true) },
                {
                    provide: DocumentService,
                    useValue: {
                        getAncestors: (documentId: string) => {
                            const currentDocument = documents.find((doc) => doc.sys_id === documentId);
                            const ancestors = documents.filter((doc) => doc.sys_path?.includes(currentDocument?.sys_name || 'non-existing-folder'));
                            return of([ROOT_DOCUMENT, ...ancestors]);
                        },
                        getFolderChildren: (parentId: string) => {
                            const children = documents.filter((doc) => doc.sys_parentId === parentId);
                            return of({
                                documents: children,
                                limit: 0,
                                offset: 0,
                                totalCount: 0,
                            });
                        },
                    },
                },
            ],
        }),
    ],
} as Meta<HxpDocumentTreeComponent>;

export const Default = {};

export const CustomRootNode = {
    render: (args: HxpDocumentTreeComponent) => ({
        props: args,
    }),
    args: {
        rootDocument: documents[3],
    },
};

export const WithMultipleSelection = {
    render: (args: HxpDocumentTreeComponent) => ({
        props: args,
    }),
    args: {
        multiSelection: true,
        documents: [documents[1], documents[2]],
    },
};
