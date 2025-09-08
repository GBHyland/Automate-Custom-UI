/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AlfrescoApiFactory } from '@alfresco/adf-content-services';
import { AlfrescoApi, AlfrescoApiConfig } from '@alfresco/js-api';

class CustomAlfrescoApi extends AlfrescoApi {
    // Overriding the original one, but with no session invalidation on Http401 error
    errorHandler(error: { status?: number }): void {
        this.emit('error', error);
        this.bufferEvents.push('error');
    }
}

export class CustomAlfrescoApiFactory implements AlfrescoApiFactory {
    createAlfrescoApi(config: AlfrescoApiConfig): AlfrescoApi {
        const updatedConfig = { ...config, oauthInit: false };
        return new CustomAlfrescoApi(updatedConfig);
    }
}
