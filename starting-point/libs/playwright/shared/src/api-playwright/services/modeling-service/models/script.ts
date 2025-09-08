/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModelCustomParameters, ModelVariation } from './';

export class Script implements ModelVariation {
    displayName = 'Script';
    namePrefix = 'pw-e2e-script-';
    type = 'SCRIPT';
    contentType = 'application/octet-stream';
    contentExtension = 'bin';

    getDefaultContent(entityName: string): string {
        return `/** Example code snippet for the script ${entityName} **/`;
    }

    getDefaultExtensionsContent(customParameters?: ModelCustomParameters) {
        if (customParameters) {
            const errors = customParameters?.errors ?? [];
            const variables = customParameters?.variables ?? [];
            return { errors, variables };
        } else {
            return {};
        }
    }
}
