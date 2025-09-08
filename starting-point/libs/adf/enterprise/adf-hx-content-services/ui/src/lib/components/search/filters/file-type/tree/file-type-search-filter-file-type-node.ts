/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export class FileTypeNode {
    id = '';
    label = '';
    formats: {
        id: string;
        label: string;
        extensions?: string[];
        mimeTypes?: string[];
        mimeTypeIcon: string;
    }[] = [];
}

export class FileTypeFlatNode {
    id = '';
    label = '';
    level?: number;
    expandable?: boolean;
    mimeTypes?: string[];
    extensions?: string[];
    mimeTypeIcon = '';
}

export const TREE_DATA: FileTypeNode[] = [
    {
        id: 'documents',
        label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.DOCUMENTS.LABEL',
        formats: [
            {
                id: 'documents/portable-document-format',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.DOCUMENTS.FORMATS.PORTABLE_DOCUMENT_FORMAT',
                extensions: ['pdf'],
                mimeTypes: ['application/pdf'],
                mimeTypeIcon: 'application/pdf',
            },
            {
                id: 'documents/presentation',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.DOCUMENTS.FORMATS.PRESENTATION',
                extensions: ['ppt', 'pptx'],
                mimeTypes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
                mimeTypeIcon: 'application/vnd.ms-powerpoint',
            },
            {
                id: 'documents/spreadsheet',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.DOCUMENTS.FORMATS.SPREADSHEET',
                extensions: ['xls', 'xlsx'],
                mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
                mimeTypeIcon: 'application/vnd.ms-excel',
            },
            {
                id: 'documents/text-document',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.DOCUMENTS.FORMATS.TEXT_DOCUMENT',
                extensions: ['doc', 'docx'],
                mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                mimeTypeIcon: 'application/msword',
            },
            {
                id: 'documents/text-file',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.DOCUMENTS.FORMATS.TEXT_FILE',
                extensions: ['txt'],
                mimeTypes: ['text/plain'],
                mimeTypeIcon: 'text/plain',
            },
        ],
    },
    {
        id: 'images',
        label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.IMAGES.LABEL',
        formats: [
            {
                id: 'images/uncompressed-image-formats',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.IMAGES.FORMATS.UNCOMPRESSED_IMAGE_FORMATS',
                extensions: ['bmp', 'raw'],
                mimeTypes: ['image/bmp', 'image/x-panasonic-raw'],
                mimeTypeIcon: 'image/bmp',
            },
            {
                id: 'images/compressed-image-formats',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.IMAGES.FORMATS.COMPRESSED_IMAGE_FORMATS',
                extensions: ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'tif', 'webp'],
                mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/tiff', 'image/webp'],
                mimeTypeIcon: 'image/png',
            },
            {
                id: 'images/vector-image-formats',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.IMAGES.FORMATS.VECTOR_IMAGE_FORMATS',
                extensions: ['eps', 'svg'],
                mimeTypes: ['image/svg+xml', 'application/postscript'],
                mimeTypeIcon: 'image/svg+xml',
            },
            {
                id: 'images/software-files',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.IMAGES.FORMATS.SOFTWARE_FILES',
                extensions: ['ai', 'eps', 'psd', 'tga'],
                mimeTypes: [
                    'image/vnd.adobe.photoshop',
                    'application/postscript',
                    'application/illustrator',
                    'application/pdf',
                    'application/vsn.adobe.illustrator',
                    'image/x-tga',
                    'image/x-targa',
                    'image/targa',
                ],
                mimeTypeIcon: 'image/vnd.adobe.photoshop',
            },
        ],
    },
    {
        id: 'video',
        label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.VIDEO.LABEL',
        formats: [
            {
                id: 'video/uncompressed-video-formats',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.VIDEO.FORMATS.UNCOMPRESSED_VIDEO_FORMATS',
                extensions: ['avi', 'mov', 'raw'],
                mimeTypes: ['video/x-msvideo', 'video/quicktime', 'image/x-panasonic-raw'],
                mimeTypeIcon: 'video/x-msvideo',
            },
            {
                id: 'video/compressed-video-formats',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.VIDEO.FORMATS.COMPRESSED_VIDEO_FORMATS',
                extensions: ['mp4', 'avi', 'mov', 'webm', 'flv'],
                mimeTypes: ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/webm', 'video/x-flv'],
                mimeTypeIcon: 'video/mp4',
            },
            {
                id: 'video/software-files',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.VIDEO.FORMATS.SOFTWARE_FILES',
                extensions: ['mov', 'mp4', '3gp'],
                mimeTypes: ['video/quicktime', 'video/mp4', 'video/3gpp'],
                mimeTypeIcon: 'video/quicktime',
            },
        ],
    },
    {
        id: 'audio',
        label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.AUDIO.LABEL',
        formats: [
            {
                id: 'audio/uncompressed-audio-formats',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.AUDIO.FORMATS.UNCOMPRESSED_AUDIO_FORMATS',
                extensions: ['wav', 'aiff', 'au', 'raw'],
                mimeTypes: ['audio/vnd.wav', 'audio/wav', 'audio/aiff', 'audio/basic', 'image/x-panasonic-raw'],
                mimeTypeIcon: 'audio/wav',
            },
            {
                id: 'audio/compressed-audio-formats',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.AUDIO.FORMATS.COMPRESSED_AUDIO_FORMATS',
                extensions: ['flac', 'wma', 'm4a', 'mp3', 'aac'],
                mimeTypes: ['audio/flac', 'audio/x-ms-wma', 'audio/m4a', 'audio/mp4', 'audio/mpeg', 'audio/aac'],
                mimeTypeIcon: 'audio/mp3',
            },
        ],
    },
    {
        id: 'other',
        label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.OTHER.LABEL',
        formats: [
            {
                id: 'other/archive-files',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.OTHER.FORMATS.ARCHIVE_FILES',
                extensions: ['7z', 'zip'],
                mimeTypes: ['application/x-7z-compressed', 'application/zip', 'application/zip-compressed', 'application/x-zip-compressed'],
                mimeTypeIcon: 'application/zip',
            },
            {
                id: 'other/font-files',
                label: 'SEARCH.FILTERS.FILE_TYPE.CATEGORIES.OTHER.FORMATS.FONT_FILES',
                extensions: ['otf', 'ttf'],
                mimeTypes: ['font/otf', 'application/x-font-otf', 'application/x-font-ttf'],
                mimeTypeIcon: 'font/otf',
            },
        ],
    },
];
