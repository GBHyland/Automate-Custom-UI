/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const IdpVerificationStatus = {
    AutoValid: 'AutoValid',
    AutoInvalid: 'AutoInvalid',
    ManualValid: 'ManualValid',
    ManualInvalid: 'ManualInvalid',
} as const;
export type IdpVerificationStatus = keyof typeof IdpVerificationStatus;

export const IdpLoadState = {
    NotInitialized: 'NotInitialized',
    Loading: 'Loading',
    Loaded: 'Loaded',
    Error: 'Error',
    Saving: 'Saving',
} as const;
export type IdpLoadState = keyof typeof IdpLoadState;

export interface IdentifierData {
    id: string;
    name: string;
}

export interface IdpTaskInfoBase {
    taskId: string;
    taskName: string;
    taskType: string;
    taskLabel: string;
    canClaimTask: boolean;
    canUnclaimTask: boolean;
    issuesToResolve: number;
    props: {
        label: string;
        value: string | number;
    }[];
}

export interface IdpImageInfo {
    blobUrl: string;
    width: number;
    height: number;
    correctionAngle?: number;
    viewerRotation?: number;
    skew?: number;
}

export interface IdpDocumentPage extends IdentifierData {
    documentId: string;
    fileReference: string;
    sourcePageIndex: number;
    rotation?: number;
    viewerRotation?: number;
    hasIssue?: boolean;
    isSelected?: boolean;
}

export const ResponseFormat = {
    Ocr: 'Ocr',
    TextLayout: 'TextLayout',
} as const;

export type ResponseFormat = typeof ResponseFormat[keyof typeof ResponseFormat];

export type IdpTaskActions = 'Save' | 'Complete' | 'Cancel' | 'Error' | 'Claim' | 'Unclaim';
