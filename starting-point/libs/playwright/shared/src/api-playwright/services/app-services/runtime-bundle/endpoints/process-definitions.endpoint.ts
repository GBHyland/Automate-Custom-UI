/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../../base.service';
import { ProcessDefinitionCloud, ProcessDefinitionsEndpointParameters, ProcessDefinitionsType } from '../../../../models';

export class RuntimeProcessDefinitionsEndpoint extends BaseService {
    private endpoint: string;

    constructor(parameters: ProcessDefinitionsEndpointParameters) {
        super(parameters.context);

        this.endpoint = `/${parameters.serviceUrl}/`;
        this.endpoint += `${parameters.admin ? 'admin/' : ''}`;
        this.endpoint += `v1/process-definitions`;
    }

    async getProcessDefinitions(): Promise<ProcessDefinitionsType | RequestResponse> {
        return this.get(this.endpoint);
    }

    async getProcessDefinitionByName(processDefinitionName: string): Promise<ProcessDefinitionCloud> {
        const processDefinitions = await this.getProcessDefinitions();
        return processDefinitions.list.entries.find((el) => el.entry.name === processDefinitionName);
    }
}
