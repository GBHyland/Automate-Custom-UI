/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppNames } from '../.';

interface ICustomThemeData {
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
    headerTextColorHex?: string;
    headerTextColor?: string;
    headerColor?: string;
    headerColorRGB?: string;
    fontSize?: string;
    fontFamily?: string;
    backgroundImageUrlQuotes?: string;
    backgroundImageUrl?: string;
    logoImage?: string;
}

interface IFormData {
    name: string;
    formWidgets?: {
        [name: string]: string;
    };
    paths?: {
        [name: string]: string;
    };
    tabs?: {
        [name: string]: string;
    };
    formStyles?: {
        [name: string]: {
            widgetId: string;
            fontSize: string;
            fontWeight: string;
            fontColor: string;
        };
    };
}

interface IProcessData {
    processName: string;
    processDefinitionKey?: string;
    userTaskName?: string;
    taskName?: string;
    userTask?: {
        name: string;
    };
    connectorName?: string;
    processTasks?: {
        [name: string]: string;
    };
    form?: IFormData;
    variables?: {
        [name: string]: {
            [name: string]: string | number | boolean;
            columnHeader?: string;
            variableId?: string;
        };
    };
    formElements?: {
        [name: string]: {
            [name: string]: string;
        };
    };
    taskFlow?: {
        [name: string]: string;
    };
    error_id?: string;
    error_code?: string;
    usedFor?: string[];
}

interface IProcessesData {
    [name: string]: IProcessData;
}

export interface IAppDetails {
    appName: string;
    appFullName?: string;
    processes?: IProcessesData;
    customTheme?: ICustomThemeData;
    schemas?: any;
    mixins?: {
        name: string;
        usedFor?: string[];
    };
    contentTypes?: {
        name: string;
        usedFor?: string[];
    };
    renditions?: {
        name: string;
        usedFor?: string[];
    };
}

interface IAppData {
    [name: string]: IAppDetails;
}

/* cSpell:disable */

export const ACTIVITI_CLOUD_APPS: IAppData = {
    SIMPLE_APP: {
        appName: 'simpleapp',
        appFullName: getApplicationNameWithEnv('simpleapp'),
        processes: {
            multiInstanceServiceTask: {
                processName: 'multiinstance-servicetask',
                processDefinitionKey: 'Process_B-f96qb1',
                usedFor: ['XAT-17481-APA'],
            },
            multiInstanceDmnParallel: {
                processName: 'multiinstance-dmnparallel',
                processDefinitionKey: 'Process_L5q60vqT',
            },
            multiInstanceManualTask: {
                processName: 'multiinstance-manualtask',
                processDefinitionKey: 'Process_Tds45xpq',
            },
            attachFileVariables: {
                processName: 'attach-file-variables',
                processDefinitionKey: 'Process_32cBP7xc',
                usedFor: ['C607009', 'C607007', 'C691635'],
            },
            attachFilesTask: {
                processName: 'attach-files-task',
                processDefinitionKey: 'Process_gOULp9v_',
                userTaskName: 'AttachFileTaskHrGroup',
                usedFor: ['C594811', 'C607007', 'C691635', 'C586808', 'C694020', 'C593552'],
                form: {
                    name: 'pw-attach-file-form',
                    formWidgets: {
                        singleMyFolder: 'Upload single file -my- folder',
                        singleRootFolder: 'Upload single file -root- folder',
                        singleStringVariable: 'Upload single file - stringPath variable',
                        singleIncorrectVariable: 'Upload single file - incorrect path variable',
                        multipleMyFolder: 'Upload multiple files -my- folder',
                        multipleParentChild: 'Upload multiple files - parent > child folder',
                        multipleSite: 'Upload multiple files - site',
                        multipleFolderVariable: 'Upload multiple files - folder variable',
                        singleContent: 'Upload sinle files form content',
                        multipleContent: 'Upload multiple files form content',
                    },
                    paths: {
                        parentFolder: 'e2e-pw-parent-folder',
                        childFolder: 'e2e-pw-child-folder',
                        stringVarPath: 'e2e-pw-string-variable',
                        site: 'e2e-attach-file-lib',
                        incorrectPath: 'e2e-pw-incorrect',
                    },
                },
            },
            attachFileWithViewers: {
                processName: 'attach-local-with-viewers',
                userTaskName: 'hruser',
                processDefinitionKey: 'Process_EsTRP9PN',
                form: {
                    name: 'attach-local-with-viewers',
                    formWidgets: {
                        attachFileWidgetId: 'Attachfile0hahhe',
                        fileViewerId: 'Fileviewer0xjuv6',
                        metadataViewerId: 'Metadataviewer098h6n',
                    },
                },
                usedFor: ['C694020'],
            },
            restConnectorProcess: {
                processDefinitionKey: 'Process_Sy7OxV8z',
                connectorName: `rest-to-json`,
                processName: `rest-connector-process`,
                variables: {
                    mockAPI: {
                        userId: 1,
                        id: 1,
                        title: 'delectus aut autem',
                        completed: false,
                    },
                },
            },
            taskExecutorRead: {
                processName: 'task-executor-read',
                processDefinitionKey: 'Process_qle2HZ0u',
                usedFor: ['C692527-APA', 'C692528-APA'],
                formElements: {
                    automaticMappingInput: { id: '#sys_task_assignee' },
                    manualMappingInput: { id: '#executorManual' },
                },
                processTasks: {
                    manualWrite: 'manual write',
                    manualRead: 'manual read',
                    automaticWrite: 'automatic write',
                    automaticRead: 'automatic read',
                },
            },
            withDisplayedVariables: {
                processDefinitionKey: 'Process_lN01YyveO',
                processName: 'with-displayed-variables',
                variables: {
                    var1: { columnHeader: 'Column. A', value: 'Value A', variableId: '7e54b4b0-d1f0-48f5-8060-adfc459be9ee' },
                    var2: { columnHeader: 'Column B !@#$%^&*()_', value: '123', variableId: '7727897b-c471-4f38-a1b3-da07e6308e44' },
                    var3: { columnHeader: 'Column C', value: 'Nov 3, 2033', variableId: '7845f9eb-7e58-417a-a933-1f48f2c97b75' },
                    var4: { columnHeader: 'Column D', value: 'Oct 16, 2024', variableId: 'f3ae6af4-b580-42ab-a74f-afc461031006' },
                    var5: { columnHeader: 'Column E', value: 'false', variableId: '8bebf1a7-189f-46a2-b2b5-bb1c05d6d349' },
                },
                usedFor: ['XAT-537', 'XAT-538', 'XAT-16816'],
            },
            withDisplayedVariablesSecond: {
                processDefinitionKey: 'Process_0eKr4YsDm',
                processName: 'with-displayed-variables-2',
                variables: {
                    var1: { columnHeader: 'Column. A', value: 'Oct 26, 2023', variableId: '20a325cb-c79b-40d5-92bf-06e3287322ce' },
                    var2: { columnHeader: 'Column B !@#$%^&*()_', value: 'Mar 12, 2037', variableId: 'c1de5c02-d76c-4a84-a460-faad915ed94c' },
                    var3: { columnHeader: 'Column C', value: 'true', variableId: '62c1a7a7-0499-49cc-968c-a6ed4dfd1618' },
                    var4: { columnHeader: 'Column D', value: '456', variableId: '0803b16d-a920-4ede-95a2-78c1063e9c9a' },
                    var5: { columnHeader: 'Column E', value: 'Value E', variableId: '114abfbf-1f42-4328-a52f-35b50aa6e9cb' },
                },
                usedFor: ['XAT-16816'],
            },
            simpleProcess: {
                processName: 'simpleprocess',
                taskName: 'taskSimple',
                processDefinitionKey: 'Process__DPVOltD',
                usedFor: ['C593526', 'AAE-7971', 'C315305', 'C692509', 'XAT-17394', 'XAT-17395', 'XAT-17396'],
                taskFlow: {
                    start: 'StartEvent_1',
                    task: 'Task_1gp4t4s',
                    end: 'EndEvent_05442a5',
                },
            },
            attachSingleSingleProcess: {
                processName: 'attach-files-process',
                processDefinitionKey: 'Process_lArQ2I9Og',
                usedFor: ['C586748'],
                formElements: {
                    firstAttachFileWidget: { id: 'Attachfile09lgsk' },
                    secondAttachFileWidget: { id: 'Attachfile0wopvy' },
                },
            },
            attachSingleMultipleProcess: {
                processName: 'attach-single-multiple',
                processDefinitionKey: 'Process_K1S3V6Cxe',
                usedFor: ['C332798'],
                formElements: {
                    firstAttachFileWidget: { id: 'Attachfile0ciulc' },
                    secondAttachFileWidget: { id: 'Attachfile006uf2' },
                },
            },
            attachMultipleMultipleProcess: {
                processName: 'attach-multiple-multiple',
                processDefinitionKey: 'Process_gR0N_FOkF',
                usedFor: ['C586749'],
                formElements: {
                    firstAttachFileWidget: { id: 'Attachfile07sqao' },
                    secondAttachFileWidget: { id: 'Attachfile018wvc' },
                },
            },
            dataTableProcess: {
                processName: 'data-table-process',
                processDefinitionKey: 'Process_aomZgN6w',
                usedFor: ['C703069'],
            },
            candidateUsersGroupProcess: {
                processName: 'candidateusersgroup',
                processDefinitionKey: 'Process_3t_gNIumM',
                usedFor: ['C587521', 'C687687', 'C704108'],
                taskName: 'candidate users and group',
            },
            candidateUserProcess: {
                processName: 'candidateuserprocess',
                processDefinitionKey: 'Process_UJ0f2XlwB',
                usedFor: ['C587520', 'C687686', 'XAT-16817'],
                taskName: 'candidateUserTask',
            },
            decisionStringProcess: {
                processName: 'processstring',
                processDefinitionKey: 'Process_24rkVVSR',
                usedFor: ['XAT-1229', 'XAT-17284', 'XAT-17285'],
                processTasks: { inputTask: 'inputtask', outputTask: 'outputtask' },
            },
            decisionIntegerProcess: {
                processName: 'processinteger',
                processDefinitionKey: 'Process_FbN7DN2e',
                usedFor: ['XAT-1230'],
            },
            decisionBooleanProcess: {
                processName: 'processboolean',
                processDefinitionKey: 'Process_ITkwFXxN',
                usedFor: ['XAT-1231'],
            },
            decisionDateProcess: {
                processName: 'processdate',
                processDefinitionKey: 'Process_FvmdAXi2',
                usedFor: ['XAT-1232'],
            },
            decisionMultiProcess: {
                processName: 'multiprocess',
                processDefinitionKey: 'Process_at2zjUes',
                usedFor: ['XAT-16407'],
            },
            formOutcomesProcess: {
                processName: 'outcome-visib-process',
                processDefinitionKey: 'Process_Aw_yChKxl',
                userTask: {
                    name: 'userTask-outcome-visib',
                },
                form: {
                    name: 'outcome-visibility',
                    formWidgets: {
                        textInputId: 'TextForOutcome',
                    },
                },
                usedFor: ['XAT-16849'],
            },
            customWidgetGenerator: {
                processName: 'custom-widget-generator',
                processDefinitionKey: 'customwidgetu3eky0hgq7u',
                userTask: {
                    name: 'custom-form-widget',
                },
                form: {
                    name: 'custom-form',
                    formWidgets: {
                        textInputId: 'customwidgetu3eky0hgq7u',
                    },
                },
                usedFor: ['XAT-17981-APA'],
            },
            skipFormValidation: {
                processName: 'skip-validation-form',
                processDefinitionKey: 'Process_tUnODJNV',
                userTask: {
                    name: 'skip-validation-form-task',
                },
                form: {
                    name: 'skip-validation-outcome-form',
                    formWidgets: {
                        textInputId: 'Text02vxr4',
                        decimalInputId: 'Decimal01zw4t',
                        amountInputId: 'Amount0xriqb',
                    },
                },
                usedFor: ['XAT-16765'],
            },
            processWithTabVisibility: {
                processName: 'processwithtabvisibility',
                processDefinitionKey: 'Process_WGAJ7OEQ',
                userTask: {
                    name: 'tabwithvisibilitycondition',
                },
                form: {
                    name: 'tabvisibilitywithvars',
                    formWidgets: {
                        inputTextOne: 'TextOne',
                        inputNumberOne: 'NumberOne',
                    },
                    tabs: {
                        tabWithFields: 'tabWithFields',
                        tabBasicVarVar: 'tabBasicVarVar',
                        tabBasicVarField: 'tabBasicVarField',
                    },
                },
                usedFor: ['XAT-16929-APA'],
            },
            startVisibilityForm: {
                processName: 'start-visibility-form',
                processDefinitionKey: 'Process_8ypTvGjd',
                form: {
                    name: 'form-visibility',
                    formWidgets: {
                        text: 'Text',
                        MultilineText: 'Multilinetext',
                    },
                },
                usedFor: ['XAT-17188'],
            },
            errorStartEventProcess: {
                processName: 'errorstartevent',
                processDefinitionKey: 'Process_5Hw-93Ly',
                error_id: 'Error_END_EVENT',
                error_code: '123',
            },
            externalPropertyProcess: {
                processName: 'external-property-process',
                processDefinitionKey: 'Process_0aBVysup',
                userTask: {
                    name: 'display mapped data',
                },
                formElements: {
                    currentUserFirstName: { id: 'DisplayExternalPropertyFirstName' },
                    currentUserUsername: { id: 'DisplayExternalPropertyUsername' },
                },
                usedFor: ['XAT-17204'],
            },
            calledProcess: {
                processName: 'calledprocess',
                processDefinitionKey: 'Process_sESncf6y',
                usedFor: ['XAT-1166'],
            },
            formErrorsProcess: {
                processName: 'form-errors-process',
                processDefinitionKey: 'Process_EwHcGov9',
                userTask: {
                    name: 'formErrors',
                },
                form: {
                    name: 'dropdownErrors',
                    formWidgets: {
                        dropdown: 'executorDropdown',
                    },
                },
                usedFor: ['XAT-1209'],
            },
            formErrorsFromInvalidPathProcess: {
                processName: 'formErrorsInvalidPath',
                processDefinitionKey: 'Process_gch5eZI2',
                userTask: {
                    name: 'InvalidPathFormError',
                },
                form: {
                    name: 'invalid-path-form',
                    formWidgets: {
                        dropdown: 'executorDropdown',
                    },
                },
                usedFor: ['XAT-1207'],
            },
            formErrorsFromInvalidIDProcess: {
                processName: 'formErrorsInvalidID',
                processDefinitionKey: 'Process_6B-kg680',
                userTask: {
                    name: 'InvalidIDFormError',
                },
                form: {
                    name: 'form-errors-invalid-id',
                    formWidgets: {
                        dropdown: 'executorDropdown',
                    },
                },
                usedFor: ['XAT-1208'],
            },
            formStylingProcess: {
                processName: 'form-styling-process',
                usedFor: ['XAT-17157'],
                form: {
                    name: 'form-with-styling',
                    formStyles: {
                        header: {
                            widgetId: 'HeaderWithStyling',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            fontColor: '#0A60CE',
                        },
                        displayText: {
                            widgetId: 'DisplayTextWithStyling',
                            fontSize: '22px',
                            fontWeight: 'normal',
                            fontColor: '#9CA3AF',
                        },
                        radioButton: {
                            widgetId: 'RadioButtonWithStyling',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            fontColor: '#04A003',
                        },
                    },
                },
            },
            sectionProcess: {
                processName: 'group-with-sections',
                usedFor: ['XAT-17534'],
                formElements: {
                    section1: {
                        id: '7fb091ce-f1c7-44fe-b977-7724e6015f39',
                    },
                    section2: {
                        id: '64fecca5-d6dd-4227-a3cb-f256e4ff8d03',
                    },
                    section3: {
                        id: '48f72335-d7f8-4ecb-8bcf-95a33cf11e26',
                    },
                    integer: {
                        id: 'IntegerSection1',
                    },
                    displayText: {
                        id: 'DisplayTextSection1',
                        style: '--adf-readonly-text-color: #DA1500; --adf-readonly-text-font-size: 14px; --adf-readonly-text-font-weight: normal;',
                    },
                    people: {
                        id: 'PeopleSection2',
                    },
                    date: {
                        id: 'DateSection2',
                    },
                    dateTime: {
                        id: 'DateandtimeSection2',
                    },
                    text: {
                        id: 'TextSection3',
                    },
                    group: {
                        id: 'GroupWithHeader',
                    },
                    sectionInTask: {
                        id: 'e31fef3e-8508-4c17-846b-1b510bf0a5e7',
                    },
                    displayValue: {
                        id: 'DisplayValueWithColspan',
                        style: 'width: 33.3333%;',
                        column: '2',
                    },
                    groupWithoutHeader: {
                        id: 'GroupWithoutHeader',
                    },
                },
            },
            processVariableFiltersProcess: {
                processName: 'variable-filters',
                processDefinitionKey: 'Process_jvbN0mPs',
                usedFor: [
                    'XAT-17719-APA',
                    'XAT-17454-APA',
                    'XAT-17450-APA',
                    'XAT-17451-APA',
                    'XAT-17452-APA',
                    'XAT-17479-APA',
                    'XAT-17482-APA',
                    'XAT-17480-APA',
                    'XAT-17483-APA',
                ],
                variables: {
                    stringVar: { columnHeader: 'string_var', variableId: 'fee5a849-4092-4d81-997a-0eb1fb11ae6b' },
                    booleanVar: { columnHeader: 'boolean_var', variableId: '811c0373-f4e0-4d3b-806a-14871550dae2' },
                    integerVar: { columnHeader: 'integer_var', variableId: '9801cfde-3998-4033-8cbd-281a217578e2' },
                    dateVar: { columnHeader: 'date_var', variableId: 'c4126b74-9f85-42d1-9962-77cc73705236' },
                    datetimeVar: { columnHeader: 'datetime_var', variableId: '70f0d9df-88f1-49d6-8d29-cf28f405add9' },
                    uniqueVar: { columnHeader: 'unique_var', variableId: 'e0c6004b-3d68-477b-af7e-5cdc71c1b018' },
                },
                taskFlow: {
                    start: 'Event_1',
                    task1: 'variable_filters_task1',
                    task2: 'variable_filters_task2',
                    end: 'Event_1g2tst9',
                },
                form: {
                    name: 'form-variables',
                    formWidgets: {
                        textInputId: 'Text0if7iw',
                        datetimeInputId: 'Dateandtime0p838b',
                        dateInputId: 'Date0r619k',
                        integerInputId: 'Integer0sm1vt',
                        checkboxInputId: 'Checkbox0i2n8c',
                        uniqueTextInputId: 'Text0a4ku2',
                    },
                },
            },
        },
        customTheme: {
            primaryColor: `rgb(148, 207, 189)`,
            textColor: 'rgb(29, 29, 29)',
            backgroundColor: `rgb(229, 229, 229)`,
            headerTextColor: 'rgb(57, 57, 57)',
            headerColor: 'rgb(223, 221, 221)',
            fontSize: '12px',
            fontFamily: 'Oswald',
            backgroundImageUrl: 'url("https://aae-rc-apa.envalfresco.com/simpleapp/rb/v1/files/paperbackground")',
            logoImage: 'https://aae-rc-apa.envalfresco.com/simpleapp/rb/v1/files/logo',
        },
    },
};

export const HXP_APPS = {
    SYS_WORKSPACE: {
        appName: 'sys-workspace',
        appFullName: getApplicationNameWithEnv('sys-workspace'),
        processes: {
            publicFormProcess: {
                processName: 'public-form-process',
                usedFor: ['XAT-17950', 'XAT-17951'],
            },
            attachFilesTask: {
                processName: 'attach-files-task',
                processDefinitionKey: 'Process_Qf1_dEm2',
                userTaskName: 'upload file(s)',
                usedFor: ['XAT-17757', 'XAT-17885', 'XAT-17886', 'XAT-17887'],
                form: {
                    name: 'attach-files-form',
                    formWidgets: {
                        singleFileLocal: 'Upload single file from Local',
                        multipleFilesLocalContent: 'Upload multiple files from Local and Content',
                        singleFileContent: 'Upload single file from Content',
                    },
                },
            },
            attachLocalWithViewers: {
                processName: 'attach-local-with-viewers',
                processDefinitionKey: 'Process_uZqQVfLp',
                userTaskName: 'attach file',
                usedFor: ['C694020'],
                form: {
                    name: 'attach-local-with-viewers',
                    formWidgets: {
                        attachFileWidgetId: 'Attachfile0mdpvh',
                        fileViewerId: 'Fileviewer0qg5xp',
                        metadataViewerId: 'Metadataviewer0rdxqq',
                    },
                },
            },
            candidateUserProcess: {
                processName: 'candidateuserprocess',
                processDefinitionKey: 'Process_UJ0f2XlwB',
                usedFor: ['C315305'],
                taskName: 'candidateUserTask',
                taskFlow: {
                    start: 'Event_1',
                    task: 'Task_0favb5k',
                    end: 'EndEvent_03pj7g0',
                },
            },
            candidateUsersGroupProcess: {
                processName: 'candidateusersgroup',
                processDefinitionKey: 'Process_3t_gNIumM',
                usedFor: ['C587521', 'C687687', 'C704108'],
                taskName: 'candidate users and group',
            },
            calledProcess: {
                processName: 'calledprocess',
                processDefinitionKey: 'Process_sESncf6y',
                usedFor: ['XAT-1166'],
            },
            multiInstanceServiceTask: {
                processName: 'multiinstance-servicetask',
                processDefinitionKey: 'Process_B-f96qb1',
                usedFor: ['XAT-17481'],
            },
            multiInstanceDmnParallel: {
                processName: 'multiinstance-dmnparallel',
                processDefinitionKey: 'Process_L5q60vqT',
            },
            multiInstanceManualTask: {
                processName: 'multiinstance-manualtask',
                processDefinitionKey: 'Process_Tds45xpq',
            },
            simpleProcess: {
                processDefinitionKey: 'Process__DPVOltD',
                processName: 'simpleprocess',
                taskFlow: {
                    start: 'StartEvent_1',
                    task: 'Task_1gp4t4s',
                    end: 'EndEvent_05442a5',
                },
            },
            decisionStringProcess: {
                processName: 'processstring',
                processDefinitionKey: 'Process_24rkVVSR',
                usedFor: ['XAT-1229', 'XAT-17284', 'XAT-17285'],
                processTasks: { inputTask: 'inputtask', outputTask: 'outputtask' },
            },
            decisionIntegerProcess: {
                processName: 'processinteger',
                processDefinitionKey: 'Process_FbN7DN2e',
                usedFor: ['XAT-1230'],
                processTasks: { inputTask: 'inputtask', outputTask: 'outputtask' },
            },
            decisionBooleanProcess: {
                processName: 'processboolean',
                processDefinitionKey: 'Process_ITkwFXxN',
                usedFor: ['XAT-1231'],
                processTasks: { inputTask: 'inputtask', outputTask: 'outputtask' },
            },
            decisionDateProcess: {
                processName: 'processdate',
                processDefinitionKey: 'Process_FvmdAXi2',
                usedFor: ['XAT-1232'],
                processTasks: { inputTask: 'inputtask', outputTask: 'outputtask' },
            },
            decisionMultiProcess: {
                processName: 'multiprocess',
                processDefinitionKey: 'Process_at2zjUes',
                usedFor: ['XAT-16407'],
                processTasks: { inputTask: 'inputtask', outputTask: 'outputtask' },
            },
            restConnectorProcess: {
                processDefinitionKey: 'Process_Sy7OxV8z',
                connectorName: `rest-to-json`,
                processName: `rest-connector-process`,
                variables: {
                    mockAPI: {
                        userId: 1,
                        id: 1,
                        title: 'delectus aut autem',
                        completed: false,
                    },
                },
            },
            errorStartEventProcess: {
                processName: 'errorstartevent',
                processDefinitionKey: 'Process_5Hw-93Ly',
                error_id: 'Error_END_EVENT',
                error_code: '123',
            },
            restCallCheckProcess: {
                processName: 'dropdowns-rest-call-check',
                processDefinitionKey: 'Process_s7tbo0SI',
                form: {
                    name: 'form-styling-process',
                    formWidgets: {
                        radioButtonId: 'Radiobuttons01pktn',
                        dropdownId: 'Dropdown0fof9k',
                    },
                },
            },
            processVariableFiltersProcess: {
                processName: 'variable-filters',
                processDefinitionKey: 'Process_jvbN0mPs',
                usedFor: ['XAT-17751', 'XAT-17453', 'XAT-17394', 'XAT-17395', 'XAT-17396', 'XAT-17479', 'XAT-17482', 'XAT-17480', 'XAT-17483'],
                variables: {
                    stringVar: { columnHeader: 'string_var', variableId: '417f39e2-0712-43b0-8e84-73e6fdd58d36' },
                    booleanVar: { columnHeader: 'boolean_var', variableId: 'f00a5848-4b0d-42c8-9efb-e714962d5e9f' },
                    integerVar: { columnHeader: 'integer_var', variableId: '568d5933-8ed0-46de-92f6-53fa27b33246' },
                    bigdecimalVal: { columnHeader: 'bigdecimal_var', variableId: 'b1e4dfee-60d8-450c-9699-07d3511a2d27' },
                    dateVar: { columnHeader: 'date_var', variableId: '3c586027-43f8-4a50-a2c6-339e0539f2c5' },
                    datetimeVar: { columnHeader: 'datetime_var', variableId: '42510e94-867f-4e81-9b6f-bdc2f04ed85e' },
                    uniqueVar: { columnHeader: 'unique_var', variableId: '1f6765e5-7d18-45c5-b9d0-0a5de3be1538' },
                },
                taskFlow: {
                    start: 'Event_1',
                    task1: 'variable_filters_task1',
                    task2: 'variable_filters_task2',
                    end: 'Event_1g2tst9',
                },
                form: {
                    name: 'form-variables',
                    formWidgets: {
                        textInputId: 'Text0if7iw',
                        decimalInputId: 'Decimal0le5e4',
                        datetimeInputId: 'Dateandtime0p838b',
                        dateInputId: 'Date0r619k',
                        integerInputId: 'Integer0sm1vt',
                        checkboxInputId: 'Checkbox0i2n8c',
                        uniqueTextInputId: 'Text0a4ku2',
                    },
                },
            },
            formOutcomesProcess: {
                processName: 'outcome-visib-process',
                processDefinitionKey: 'Process_Aw_yChKxl',
                userTask: {
                    name: 'userTask-outcome-visib',
                },
                form: {
                    name: 'outcome-visibility',
                    formWidgets: {
                        textInputId: 'TextForOutcome',
                    },
                },
                usedFor: ['XAT-16849'],
            },
            customWidgetGenerator: {
                processName: 'custom-widget-generator',
                processDefinitionKey: 'Process_1747215360834',
                userTask: {
                    name: 'custom-widget-generator',
                },
                form: {
                    name: 'custom-form',
                    formWidgets: {
                        textInputId: 'customwidgetu3eky0cx295',
                    },
                },
                usedFor: ['XAT-17981'],
            },
            skipFormValidation: {
                processName: 'skip-validation-form',
                processDefinitionKey: 'Process_tUnODJNV',
                userTask: {
                    name: 'skip-validation-form-task',
                },
                form: {
                    name: 'skip-validation-outcome-form',
                    formWidgets: {
                        textInputId: 'Text02vxr4',
                        decimalInputId: 'Decimal01zw4t',
                        amountInputId: 'Amount0xriqb',
                    },
                },
                usedFor: ['XAT-16765'],
            },
            formStylingProcess: {
                processName: 'form-styling-process',
                usedFor: ['XAT-17157'],
                form: {
                    name: 'form-with-styling',
                    formStyles: {
                        header: {
                            widgetId: 'HeaderWithStyling',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            fontColor: '#0A60CE',
                        },
                        displayText: {
                            widgetId: 'DisplayTextWithStyling',
                            fontSize: '22px',
                            fontWeight: 'normal',
                            fontColor: '#9CA3AF',
                        },
                        radioButton: {
                            widgetId: 'RadioButtonWithStyling',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            fontColor: '#04A003',
                        },
                    },
                },
            },
            formErrorsProcess: {
                processName: 'form-errors-process',
                processDefinitionKey: 'Process_EwHcGov9',
                userTask: {
                    name: 'formErrors',
                },
                form: {
                    name: 'dropdownErrors',
                    formWidgets: {
                        dropdown: 'executorDropdown',
                    },
                },
                usedFor: ['XAT-1209'],
            },
            formErrorsFromInvalidPathProcess: {
                processName: 'formErrorsInvalidPath',
                processDefinitionKey: 'Process_gch5eZI2',
                userTask: {
                    name: 'InvalidPathFormError',
                },
                form: {
                    name: 'invalid-path-form',
                    formWidgets: {
                        dropdown: 'executorDropdown',
                    },
                },
                usedFor: ['XAT-1207'],
            },
            formErrorsFromInvalidIDProcess: {
                processName: 'formErrorsInvalidID',
                processDefinitionKey: 'Process_6B-kg680',
                userTask: {
                    name: 'InvalidIDFormError',
                },
                form: {
                    name: 'form-errors-invalid-id',
                    formWidgets: {
                        dropdown: 'executorDropdown',
                    },
                },
                usedFor: ['XAT-1208'],
            },
            displayExternalPropertyProcess: {
                processName: 'display-external-property',
                usedFor: ['XAT-477'],
                userTaskName: 'display mapped data',
                formElements: {
                    currentUserFirstName: { id: 'DisplayExternalPropertyFirstName' },
                    currentUserUsername: { id: 'DisplayExternalPropertyUsername' },
                },
            },
            dataTableProcess: {
                processName: 'data-table-process',
                usedFor: ['XAT-16631'],
            },
            sectionProcess: {
                processName: 'group-with-sections',
                usedFor: ['XAT-17534'],
                formElements: {
                    section1: {
                        id: '7fb091ce-f1c7-44fe-b977-7724e6015f39',
                    },
                    section2: {
                        id: '64fecca5-d6dd-4227-a3cb-f256e4ff8d03',
                    },
                    section3: {
                        id: '48f72335-d7f8-4ecb-8bcf-95a33cf11e26',
                    },
                    integer: {
                        id: 'IntegerSection1',
                    },
                    displayText: {
                        id: 'DisplayTextSection1',
                        style: '--adf-readonly-text-color: #DA1500; --adf-readonly-text-font-size: 14px; --adf-readonly-text-font-weight: normal;',
                    },
                    people: {
                        id: 'PeopleSection2',
                    },
                    date: {
                        id: 'DateSection2',
                    },
                    dateTime: {
                        id: 'DateandtimeSection2',
                    },
                    text: {
                        id: 'TextSection3',
                    },
                    group: {
                        id: 'GroupWithHeader',
                    },
                    sectionInTask: {
                        id: 'e31fef3e-8508-4c17-846b-1b510bf0a5e7',
                    },
                    displayValue: {
                        id: 'DisplayValueWithColspan',
                        style: 'width: 33.3333%;',
                        column: '2',
                    },
                    groupWithoutHeader: {
                        id: 'GroupWithoutHeader',
                    },
                },
            },
            pdfGenerationProcess: {
                processName: 'pdf-generation',
                processDefinitionKey: 'Process_mOpESkMX',
                usedFor: ['XAT-17745'],
                form: {
                    name: 'pdf-generation-form',
                    formWidgets: {
                        textInputId: 'Text0fem2h',
                        integerInputId: 'Integer0nipxg',
                        decimalInputId: 'Decimal0o48v0',
                        dateInputId: 'Date0zixsv',
                        datetimeInputId: 'Dateandtime0fcp48',
                        multilinetextInputId: 'Multilinetext0tonpk',
                        amountInputId: 'Amount0ibdmn',
                        checkboxInputId: 'Checkbox0kfa11',
                        dropdownSingle: 'Dropdown0zr4wm',
                        dropdownMultiple: 'Dropdown0y5e84',
                        radiobuttonsInputId: 'Radiobuttons0r5hwp',
                    },
                },
            },
            processWithTabVisibility: {
                processName: 'processwithtabvisibility',
                processDefinitionKey: 'Process_WGAJ7OEQ',
                userTask: {
                    name: 'tabwithvisibilitycondition',
                },
                form: {
                    name: 'tabvisibilitywithvars',
                    formWidgets: {
                        inputTextOne: 'TextOne',
                        inputNumberOne: 'NumberOne',
                    },
                    tabs: {
                        tabWithFields: 'tabWithFields',
                        tabBasicVarVar: 'tabBasicVarVar',
                        tabBasicVarField: 'tabBasicVarField',
                    },
                },
                usedFor: ['XAT-16929'],
            },
            taskExecutorRead: {
                processName: 'task-executor-read',
                processDefinitionKey: 'Process_qle2HZ0u',
                usedFor: ['C692527', 'C692528'],
                formElements: {
                    automaticMappingInput: { id: '#sys_task_assignee' },
                    manualMappingInput: { id: '#executorManual' },
                },
                processTasks: {
                    manualWrite: 'manual write',
                    manualRead: 'manual read',
                    automaticWrite: 'automatic write',
                    automaticRead: 'automatic read',
                },
            },
            startVisibilityForm: {
                processName: 'start-visibility-form',
                processDefinitionKey: 'Process_8ypTvGjd',
                form: {
                    name: 'form-visibility',
                    formWidgets: {
                        text: 'Text',
                        MultilineText: 'Multilinetext',
                    },
                },
                usedFor: ['XAT-17188'],
            },
            subJtiTokensProcess: {
                processName: 'sub-jti-claims-process',
                userTask: { name: 'sub-jti-usertask' },
                processDefinitionKey: 'Process_1746508681051',
                usedFor: ['XAT-17947'],
            },
            withDisplayedVariables: {
                processDefinitionKey: 'Process_lN01YyveO',
                processName: 'with-displayed-variables',
                variables: {
                    var1: { columnHeader: 'Column. A', value: 'Value A', variableId: '7e54b4b0-d1f0-48f5-8060-adfc459be9ee' },
                    var2: { columnHeader: 'Column B !@#$%^&*()_', value: '123', variableId: '7727897b-c471-4f38-a1b3-da07e6308e44' },
                    var3: { columnHeader: 'Column C', value: 'Nov 3, 2033', variableId: '7845f9eb-7e58-417a-a933-1f48f2c97b75' },
                    var4: { columnHeader: 'Column D', value: 'Oct 16, 2024', variableId: 'f3ae6af4-b580-42ab-a74f-afc461031006' },
                    var5: { columnHeader: 'Column E', value: 'false', variableId: '8bebf1a7-189f-46a2-b2b5-bb1c05d6d349' },
                },
                usedFor: ['XAT-537', 'XAT-538', 'XAT-16816'],
            },
            withDisplayedVariablesSecond: {
                processDefinitionKey: 'Process_0eKr4YsDm',
                processName: 'with-displayed-variables-2',
                variables: {
                    var1: { columnHeader: 'Column. A', value: 'Oct 26, 2023', variableId: '20a325cb-c79b-40d5-92bf-06e3287322ce' },
                    var2: { columnHeader: 'Column B !@#$%^&*()_', value: 'Mar 12, 2037', variableId: 'c1de5c02-d76c-4a84-a460-faad915ed94c' },
                    var3: { columnHeader: 'Column C', value: 'true', variableId: '62c1a7a7-0499-49cc-968c-a6ed4dfd1618' },
                    var4: { columnHeader: 'Column D', value: '456', variableId: '0803b16d-a920-4ede-95a2-78c1063e9c9a' },
                    var5: { columnHeader: 'Column E', value: 'Value E', variableId: '114abfbf-1f42-4328-a52f-35b50aa6e9cb' },
                },
                usedFor: ['XAT-16816'],
            },
        },
        schemas: {
            name: 'xat-17046-schema',
            usedFor: ['XAT-17046'],
        },
        mixins: {
            name: 'xat-17046-mixin',
            usedFor: ['XAT-17046'],
        },
        contentTypes: {
            name: 'xat-17046-content-type',
            usedFor: ['XAT-17046'],
        },
        renditions: {
            name: 'xat-17046-rendition',
            usedFor: ['XAT-17046'],
        },
        customTheme: {
            primaryColor: `rgb(148, 207, 189)`,
            textColor: 'rgb(29, 29, 29)',
            backgroundColor: `rgb(229, 229, 229)`,
            headerTextColor: 'rgb(57, 57, 57)',
            headerTextColorHex: `#393939`,
            headerColor: '#DFDDDD',
            headerColorRGB: 'rgb(223, 221, 221)',
            fontSize: '12px',
            fontFamily: 'Oswald',
            backgroundImageUrl: 'url(https://hxps-rc.studio.dev.experience.hyland.com/sys-workspace-cab2409f/rb/v1/files/background)',
            backgroundImageUrlQuotes: 'url("https://hxps-rc.studio.dev.experience.hyland.com/sys-workspace-cab2409f/rb/v1/files/background")',
            logoImage: 'https://hxps-rc.studio.dev.experience.hyland.com/sys-workspace-cab2409f/rb/v1/files/logo',
        },
    },

    SYS_IDP_E2E: {
        appName: 'sys-idp-e2e',
        appFullName: getApplicationNameWithEnv('sys-idp-e2e'),
        processes: {
            idpFieldVerification: {
                processName: 'idp-field-verification',
                processDefinitionKey: 'Process_X-fXzEAf',
                connectorName: 'idp-connector',
                userTaskName: 'Field Review UI',
                variables: {
                    attachedFiles: {
                        id: 'b6868d96-ef41-4b70-bdd6-7ffcfd93f7f3',
                        name: 'contents',
                        type: 'array',
                    },
                    batchState: {
                        id: '27f42249-9092-420c-9893-5e644412be11',
                        name: 'batchState',
                        type: 'json',
                    },
                    rejectReasons: {
                        id: '398c61be-38af-405c-b67f-94db062c0038',
                        name: 'rejectReasons',
                        type: 'array',
                    },
                },
                formElements: {
                    attachFileWidget: {
                        id: 'Attachfile05iyfs',
                        name: 'Attach file',
                        type: 'hxp-upload',
                    },
                },
                taskFlow: {
                    start: 'Event_1',
                    subProcess: 'Activity_1qkqrh8',
                    userTask: 'Activity_1wt60hj',
                    end: 'Event_0kbkkcb',
                },
            },
            idpClassVerification: {
                processName: 'idp-class-verification',
                processDefinitionKey: 'Process_chmdp94_',
                userTask: {
                    name: 'Class Review',
                },
                variables: {
                    attachedFiles: {
                        id: 'b6868d96-ef41-4b70-bdd6-7ffcfd93f7f3',
                        name: 'contents',
                        type: 'array',
                    },
                    batchState: {
                        id: '27f42249-9092-420c-9893-5e644412be11',
                        name: 'batchState',
                        type: 'json',
                    },
                    rejectReasons: {
                        id: '398c61be-38af-405c-b67f-94db062c0038',
                        name: 'rejectReasons',
                        type: 'array',
                    },
                    targetFolder: {
                        id: '',
                        name: 'targetFolder',
                        type: 'string',
                    },
                },
                formElements: {
                    attachFileWidget: {
                        id: 'Attachfile05iyfs',
                        name: 'Attach file',
                        type: 'hxp-upload',
                    },
                },
                taskFlow: {
                    start: 'Event_1',
                    subProcess: 'Activity_0719th9',
                    userTask: 'Activity_1csv596',
                    end: 'Event_15ofv4q',
                },
            },
            idpClaimClassificationTask: {
                processName: 'idp-class-claiming',
                processDefinitionKey: 'Process_U5AyUSo_',
                userTask: {
                    name: 'Claimable Classification Task',
                },
                variables: {
                    attachedFiles: {
                        id: 'b6868d96-ef41-4b70-bdd6-7ffcfd93f7f3',
                        name: 'contents',
                        type: 'array',
                    },
                    batchState: {
                        id: '27f42249-9092-420c-9893-5e644412be11',
                        name: 'batchState',
                        type: 'json',
                    },
                    rejectReasons: {
                        id: '398c61be-38af-405c-b67f-94db062c0038',
                        name: 'rejectReasons',
                        type: 'array',
                    },
                },
                formElements: {
                    attachFileWidget: {
                        id: 'Attachfile05iyfs',
                        name: 'Attach file',
                        type: 'hxp-upload',
                    },
                },
                taskFlow: {
                    start: 'Event_1',
                    task: 'Activity_1lo0y3i',
                    end: 'Event_1d4ojg7',
                },
            },
            idpNestedProcess: {
                processName: 'idp-nested-process',
                processDefinitionKey: 'Process_oOftLakI',
                userTask: {
                    name: 'Child Classification Task',
                },
                variables: {
                    attachedFiles: {
                        id: 'b6868d96-ef41-4b70-bdd6-7ffcfd93f7f3',
                        name: 'contents',
                        type: 'array',
                    },
                    batchState: {
                        id: '27f42249-9092-420c-9893-5e644412be11',
                        name: 'batchState',
                        type: 'json',
                    },
                    rejectReasons: {
                        id: '398c61be-38af-405c-b67f-94db062c0038',
                        name: 'rejectReasons',
                        type: 'array',
                    },
                },
                formElements: {
                    attachFileWidget: {
                        id: 'Attachfile05iyfs',
                        name: 'Attach file',
                        type: 'hxp-upload',
                    },
                },
                taskFlow: {
                    start: 'Event_1',
                    task: 'Activity_0r9jfpd',
                    end: 'Event_1d4ojg7',
                },
            },
        },
    },
} as const satisfies IAppData;

export function getApplicationNameWithEnv(appName: string) {
    return process.env['APP_CONFIG_ENVIRONMENT_ID'] ? `${appName}-${process.env['APP_CONFIG_ENVIRONMENT_ID'].slice(0, 8)}` : appName;
}

/**
 * Returns deployed application info depending on the running app.
 *
 * @param {any} config A parameter containing information about currently working app - accepts workerInfo or projectInfo (use).
 * @returns {IAppDetails} Returns information about the app from index.ts.
 */
export function getDeployedApp(config: any): IAppDetails {
    const appName = config.appName || config.project.use.appName;

    switch (appName) {
        case AppNames.StudioApa:
        case AppNames.AdminApa:
        case AppNames.ContentEeApa: {
            return ACTIVITI_CLOUD_APPS.SIMPLE_APP;
        }
        case AppNames.HxPStudio:
        case AppNames.AdminHxp:
        case AppNames.WorkspaceHxP: {
            return HXP_APPS.SYS_WORKSPACE;
        }
        case AppNames.WorkspaceHxPIdp: {
            return HXP_APPS.SYS_IDP_E2E;
        }
        default: {
            return HXP_APPS.SYS_WORKSPACE;
        }
    }
}
