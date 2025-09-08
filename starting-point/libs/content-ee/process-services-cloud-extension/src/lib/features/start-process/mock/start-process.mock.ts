/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

const navigation = {
    url: '/valid/path',
};

const fileEntry = {
    entry: {
        isFile: true,
        nodeType: 'cm:content',
    },
};

const lockedFileEntry = {
    entry: {
        isFile: true,
        nodeType: 'cm:content',
        properties: {
            'cm:lockLifetime': 'PERSISTENT',
            'cm:lockOwner': {
                displayName: 'mockuser',
                id: 'mockuser',
            },
            'cm:lockType': 'WRITE_LOCK',
        },
    },
};

const folderEntry = {
    entry: {
        isFile: false,
        isFolder: true,
        nodeType: 'cm:folder',
    },
};

const fileLinkEntry = {
    entry: {
        isFile: true,
        nodeType: 'app:filelink',
    },
};

const libraryEntry = {
    entry: {
        id: 'abc',
        guid: '18ebc02d-3be0-46cc-a50c-27621c630942',
        title: 'fake-abc',
        visibility: 'PUBLIC',
        preset: 'site-dashboard-preset',
        role: 'SiteManagerRole',
    },
    isLibrary: true,
};

const favouriteLibraryEntry = {
    entry: {
        id: 'zyx',
        guid: '3be046cc-a50c-18ebc02d-xrt2adf2t',
        title: 'fake-zyx',
        visibility: 'PUBLIC',
        preset: 'site-dashboard-preset',
        role: 'SiteManagerRole',
    },
    isLibrary: true,
    isFavorite: true,
};

export const mockLockedFileSelection = {
    selection: {
        nodes: [{ ...lockedFileEntry }],
    },
    navigation,
};

export const mockMultiFileLinkSelection = {
    selection: {
        nodes: [{ ...fileEntry }, { ...fileLinkEntry }],
    },
    navigation,
};

export const mockSingleFileLinkSelection = {
    selection: {
        nodes: [{ ...fileLinkEntry }],
    },
    navigation,
};

export const mockMultiLibrarySelection = {
    selection: {
        nodes: [{ ...libraryEntry }, { ...favouriteLibraryEntry }],
    },
    navigation,
};

export const mockSingleLibrarySelection = {
    selection: {
        nodes: [{ ...libraryEntry }],
    },
    navigation,
};

export const mockMultiFolderSelection = {
    selection: {
        nodes: [{ ...fileEntry }, { ...fileEntry }, { ...folderEntry }],
    },
    navigation,
};

export const mockSingleFolderSelection = {
    selection: {
        nodes: [{ ...folderEntry }],
    },
    navigation,
};

export const mockMultiFileSelection = {
    selection: {
        nodes: [{ ...fileEntry }, { ...fileEntry }],
    },
    navigation,
};

export const formWithNoWidgets = {
    formRepresentation: {
        id: 'form-82aa3792-f36a-4571-bd72-97e3bbb5d955',
        name: 'empty-form',
        description: '',
        version: 0,
        standAlone: true,
        formDefinition: { tabs: [], fields: [], outcomes: [], metadata: {}, variables: [] },
    },
};

export const formWithUploadWidgets: any = {
    formRepresentation: {
        id: 'form-82aa3792-f36a-4571-bd72-97e3bbb5d955',
        name: 'empty-form',
        description: '',
        version: 0,
        standAlone: true,
        formDefinition: {
            tabs: [],
            fields: [
                {
                    fieldType: 'ContainerRepresentation',
                    id: '7c01ed35-be86-4be7-9c28-ed640a5a2ae1',
                    name: 'Label',
                    type: 'container',
                    tab: null,
                    numberOfColumns: 2,
                    fields: {
                        '1': [
                            {
                                fieldType: 'AttachFileFieldRepresentation',
                                id: 'attachFile1',
                                name: 'Attach file1',
                                type: 'upload',
                                value: null,
                                required: false,
                                readOnly: true,
                                overrideId: false,
                                colspan: 1,
                                placeholder: null,
                                visibilityCondition: null,
                                params: {
                                    existingColspan: 1,
                                    maxColspan: 2,
                                    fileSource: {
                                        serviceId: 'all-file-sources',
                                        name: 'All file sources',
                                    },
                                    multiple: false,
                                    link: false,
                                },
                            },
                        ],
                        '2': [
                            {
                                fieldType: 'AttachFileFieldRepresentation',
                                id: 'attachFile2',
                                name: 'Attach file2',
                                type: 'upload',
                                value: null,
                                required: false,
                                readOnly: true,
                                overrideId: false,
                                colspan: 1,
                                placeholder: null,
                                visibilityCondition: null,
                                params: {
                                    existingColspan: 1,
                                    maxColspan: 2,
                                    fileSource: {
                                        serviceId: 'all-file-sources',
                                        name: 'All file sources',
                                    },
                                    multiple: false,
                                    link: false,
                                },
                            },
                        ],
                    },
                },
                {
                    id: 'mock-group-id',
                    name: 'Group',
                    type: 'group',
                    tab: null,
                    params: {
                        hideHeader: false,
                        allowCollapse: false,
                        collapseByDefault: false,
                    },
                    numberOfColumns: 1,
                    fields: {
                        1: [
                            {
                                id: '02cf0831-3da2-4dff-a23c-95814b1b0421',
                                name: 'Section',
                                type: 'section',
                                numberOfColumns: 1,
                                fields: {
                                    1: [
                                        {
                                            id: 'mock-attach-file-inside-section-id',
                                            name: 'Attach file',
                                            type: 'upload',
                                            readOnly: false,
                                            required: false,
                                            colspan: 1,
                                            rowspan: 1,
                                            visibilityCondition: null,
                                            params: {
                                                existingColspan: 1,
                                                maxColspan: 2,
                                                fileSource: {
                                                    serviceId: 'all-file-sources',
                                                    name: 'All file sources',
                                                },
                                                multiple: false,
                                                link: false,
                                            },
                                        },
                                    ],
                                },
                                colspan: 1,
                            },
                        ],
                    },
                },
            ],
            outcomes: [],
            metadata: {},
            variables: [],
        },
    },
};

export const formWithoutUploadWidgets = {
    formRepresentation: {
        id: 'form-82aa3792-f36a-4571-bd72-97e3bbb5d955',
        name: 'empty-form',
        description: '',
        version: 0,
        standAlone: true,
        formDefinition: {
            tabs: [],
            fields: [
                {
                    fieldType: 'ContainerRepresentation',
                    id: '26b10e64-0403-4686-a75b-0d45279ce3a8',
                    name: 'Label',
                    type: 'container',
                    tab: null,
                    numberOfColumns: 2,
                    fields: {
                        '1': [
                            {
                                fieldType: 'FormFieldRepresentation',
                                id: 'text1',
                                name: 'Text1',
                                type: 'text',
                                value: null,
                                required: false,
                                readOnly: true,
                                overrideId: false,
                                colspan: 1,
                                placeholder: null,
                                minLength: 0,
                                maxLength: 0,
                                minValue: null,
                                maxValue: null,
                                regexPattern: null,
                                visibilityCondition: null,
                                params: {
                                    existingColspan: 1,
                                    maxColspan: 2,
                                },
                            },
                        ],
                        '2': [
                            {
                                fieldType: 'FormFieldRepresentation',
                                id: 'text2',
                                name: 'Text2',
                                type: 'text',
                                value: null,
                                required: false,
                                readOnly: true,
                                overrideId: false,
                                colspan: 1,
                                placeholder: null,
                                minLength: 0,
                                maxLength: 0,
                                minValue: null,
                                maxValue: null,
                                regexPattern: null,
                                visibilityCondition: null,
                                params: {
                                    existingColspan: 1,
                                    maxColspan: 2,
                                },
                            },
                        ],
                    },
                },
            ],
            outcomes: [],
            metadata: {},
            variables: [],
        },
    },
};
