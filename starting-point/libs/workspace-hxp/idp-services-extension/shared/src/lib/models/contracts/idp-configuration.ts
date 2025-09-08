/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface IdpConfiguration {
    classification: IdpClassificationConfiguration;
    extraction: IdpExtractionConfiguration;
}

export interface IdpDocumentClassDefinition {
    id: string;
    name: string;
    description: string;
}

export enum IdpFieldDataType {
    Text = 'Text',
    Table = 'Table',
    Reasoning = 'Reasoning',
}

export interface IdpFieldDefinition {
    id: string;
    name: string;
    dataType: IdpFieldDataType;
    format: string;
    description: string;
}

export interface IdpClassificationConfiguration {
    documentClassDefinitions: IdpDocumentClassDefinition[];
    classificationConfidenceThreshold: number;
}

interface IdpFieldDefinitionsByClass {
    documentClassId: string;
    fieldDefinitions: IdpFieldDefinition[];
    fieldConfidenceThreshold: number;
}

export interface IdpExtractionConfiguration {
    fieldDefinitionsByClass: IdpFieldDefinitionsByClass[];
}
