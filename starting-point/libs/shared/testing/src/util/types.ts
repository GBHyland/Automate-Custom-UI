/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export type ConnectorActionInputParameter = string;
export type ConnectorActionOutputParameterName = string;
export interface ServiceInputParameterMapping {
    [parameterName: string]: {
        type: MappingType;
        value: ConnectorActionInputParameter;
    };
}

export interface ServiceOutputParameterMapping {
    [variableName: string]: {
        type: MappingType;
        value: ConnectorActionOutputParameterName;
    };
}

export enum MappingType {
    variable = 'variable',
    value = 'value',
    static = 'static_value',
}
export interface ModelPropertyConstraint {
    name: string;
    prefixedName: string;
    type: string;
    parameters: any[];
}
