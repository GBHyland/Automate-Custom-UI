/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CustomAPIRequest } from '../../..';
import { BaseService, RequestResponse } from '../../base.service';
export interface VariableDataAPI {
    environmentId: string;
    name: string;
    value: string;
}
export class EnvironmentVariablesEndpoint extends BaseService {
    private readonly endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `${serviceUrl}/v1/variables`;
    }

    async getVariablesList(): Promise<RequestResponse> {
        return this.get(`${this.endpoint}`);
    }

    async deleteVariable(name: string): Promise<RequestResponse> {
        const variableId = await this.getVariableIdByName(name);
        return this.delete(`${this.endpoint}/${variableId}`);
    }

    async getVariableIdByName(name: string): Promise<RequestResponse> {
        const variables = await this.getVariablesList();
        const variable = variables.find((v: any) => v.name === name);
        return variable?.id;
    }

    async isVariableExists(name: string): Promise<boolean> {
        const variableList = await this.getVariablesList();
        return variableList.some((variable: any) => variable.name === name);
    }

    async createVariable(variableData: VariableDataAPI): Promise<RequestResponse> {
        return this.post(`${this.endpoint}`, { data: variableData });
    }
}
