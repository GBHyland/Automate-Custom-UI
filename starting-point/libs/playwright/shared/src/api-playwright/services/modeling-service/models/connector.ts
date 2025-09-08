/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModelVariation } from './';

export class Connector implements ModelVariation {
    displayName = 'Connector';
    namePrefix = 'pw-e2e-connector-';
    type = 'CONNECTOR';
    contentType = 'application/json';
    contentExtension = 'json';

    getDefaultContent(entityName: string) {
        return JSON.stringify({
            name: entityName,
        });
    }

    getDefaultExtensionsContent() {
        return {};
    }
}
