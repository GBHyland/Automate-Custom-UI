/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../..';
import { StandaloneTaskData, TaskDataEntry, CustomAPIRequest } from '../../../..';

export class FormsEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `/${serviceUrl}/form/v1/forms`;
    }

    async submitForm(userTask: TaskDataEntry, formValues: any): Promise<StandaloneTaskData | RequestResponse> {
        const { id, formKey, processInstanceId } = userTask;
        const postBody = {
            values: formValues,
            taskId: id,
            processInstanceId: processInstanceId,
        };
        return this.post(`${this.endpoint}/${formKey}/submit`, { data: postBody });
    }
}
