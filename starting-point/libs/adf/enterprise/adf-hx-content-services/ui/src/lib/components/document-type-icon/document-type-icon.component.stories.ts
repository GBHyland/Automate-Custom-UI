/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Meta } from '@storybook/angular';
import { ContentTypeIconComponent } from './document-type-icon.component';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';

const documents: Record<string, Document> = {
    'Plain text': mocks.fileDocument,
    Image: { ...mocks.fileDocument, sysfile_blob: { mimeType: 'image/png' } },
    Pdf: { ...mocks.fileDocument, sysfile_blob: { mimeType: 'application/pdf' } },
    Excel: { ...mocks.fileDocument, sysfile_blob: { mimeType: 'application/vnd.ms-excel' } },
    CSV: { ...mocks.fileDocument, sysfile_blob: { mimeType: 'text/csv' } },
    XML: { ...mocks.fileDocument, sysfile_blob: { mimeType: 'text/xml' } },
    HTML: { ...mocks.fileDocument, sysfile_blob: { mimeType: 'text/html' } },
    ZIP: { ...mocks.fileDocument, sysfile_blob: { mimeType: 'application/zip' } },
    Video: { ...mocks.fileDocument, sysfile_blob: { mimeType: 'video/mp4' } },
};

export default {
    title: 'Ui/Core/Document Icon',
    component: ContentTypeIconComponent,
} as Meta<ContentTypeIconComponent>;

export const FileIcon = {
    render: (args: ContentTypeIconComponent) => ({
        props: args,
    }),
    argTypes: {
        document: {
            options: Object.keys(documents),
            control: {
                type: 'select',
            },
            mapping: documents,
        },
    },
    args: {
        document: documents['Plain text'],
    },
};

export const ExpandedFolderIcon = {
    render: (args: ContentTypeIconComponent) => ({
        props: args,
    }),
    args: {
        document: mocks.folderDocument,
        isExpanded: true,
    },
};

export const NotExpandedFolderIcon = {
    render: (args: ContentTypeIconComponent) => ({
        props: args,
    }),
    args: {
        document: mocks.folderDocument,
        isExpanded: false,
    },
};
