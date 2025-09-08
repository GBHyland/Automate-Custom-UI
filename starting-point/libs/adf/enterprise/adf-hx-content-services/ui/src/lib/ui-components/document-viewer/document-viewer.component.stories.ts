/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ViewUtilService, ThumbnailService as AdfThumbnailService, VIEWER_DIRECTIVES } from '@alfresco/adf-core';
import { BlobDownloadService } from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { of } from 'rxjs';
import { I18nModule } from '../../configs/storybook/i18n.module';
import { HxpUiDocumentViewerComponent } from './document-viewer.component';
import { ThumbnailService } from '@alfresco/adf-hx-content-services/icons';
import { htmlContent, imageBase64, pdfBase64 } from './file-contents.mock';
import { importProvidersFrom } from '@angular/core';
import { ADF_HX_CONTENT_SERVICES_API_PROVIDERS, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';

const documents: Partial<Document>[] = [
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af83',
        sys_title: 'text-file.txt',
        sysfile_blob: { filename: 'text-file.txt', mimeType: 'text/plain' },
    },
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af85',
        sys_title: 'sample.json',
        sysfile_blob: { filename: 'sample.json', mimeType: 'application/json' },
    },
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af84',
        sys_title: 'home.html',
        sysfile_blob: { filename: 'home.html', mimeType: 'text/html' },
    },
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af87',
        sys_title: 'bird.png',
        sysfile_blob: { filename: 'bird.png', mimeType: 'image/png' },
    },
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af88',
        sys_title: 'sample-doc.pdf',
        sysfile_blob: { filename: 'sample-doc.pdf', mimeType: 'application/pdf' },
    },
    {
        sys_id: 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af86',
        sys_title: 'unknown-format',
        sysfile_blob: { filename: 'unknown', mimeType: 'unknown' },
    },
];

export default {
    title: 'Ui/Core/Document Viewer',
    component: HxpUiDocumentViewerComponent,
    argTypes: {
        document: {
            options: documents.reduce((acc, doc) => {
                acc[doc.sys_title || ''] = doc;
                return acc;
            }, {}),
            control: {
                type: 'select',
            },
        },
    },
    decorators: [
        applicationConfig({
            providers: [mockHxcsJsClientConfigurationService, importProvidersFrom(I18nModule), ...ADF_HX_CONTENT_SERVICES_API_PROVIDERS],
        }),
        moduleMetadata({
            imports: [...VIEWER_DIRECTIVES],
            providers: [
                {
                    provide: ViewUtilService,
                    useValue: {
                        getViewerTypeByMimeType: (mimeType: string) => mimeType,
                    },
                },
                {
                    provide: BlobDownloadService,
                    useValue: {
                        downloadBlob: (documentId: string) => {
                            if (documentId === documents[0].sys_id) {
                                return of(new Blob(['This is a simple text file'], { type: 'text/plain' }));
                            }
                            if (documentId === documents[1].sys_id) {
                                return of(new Blob(['{"key": "value", "title": "A json file example"}'], { type: 'text/plain' }));
                            }
                            if (documentId === documents[2].sys_id) {
                                return of(new Blob([htmlContent], { type: 'text/html' }));
                            }
                            if (documentId === documents[3].sys_id) {
                                return of(b64toBlob(imageBase64, 'image/png'));
                            }
                            if (documentId === documents[4].sys_id) {
                                return of(b64toBlob(pdfBase64, 'application/pdf'));
                            }
                            return of(new Blob());
                        },
                    },
                },
                { provide: AdfThumbnailService, useClass: ThumbnailService },
            ],
        }),
    ],
} as Meta<HxpUiDocumentViewerComponent>;

export const Text = {
    render: (args: HxpUiDocumentViewerComponent) => ({
        props: args,
    }),
    args: {
        document: documents[0],
    },
};

export const Image = {
    render: (args: HxpUiDocumentViewerComponent) => ({
        props: args,
    }),
    args: {
        document: documents[3],
    },
};

export const PDF = {
    render: (args: HxpUiDocumentViewerComponent) => ({
        props: args,
    }),
    args: {
        document: documents[4],
    },
};

export const UnknownFormat = {
    render: (args: HxpUiDocumentViewerComponent) => ({
        props: args,
    }),
    args: {
        document: documents[5],
    },
};

const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    const byteCharacters = window.atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers: number[] = Array.from({ length: slice.length });
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.codePointAt(i) as number;
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
};
