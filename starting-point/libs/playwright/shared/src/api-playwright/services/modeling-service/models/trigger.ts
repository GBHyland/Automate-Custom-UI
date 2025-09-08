/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModelVariation } from './';

export class Trigger implements ModelVariation {
    displayName = 'Trigger';
    namePrefix = 'pw-e2e-trigger-';
    type = 'TRIGGER';
    contentType = 'application/json';
    contentExtension = 'json';

    getDefaultContent(entityName: string, entityId: string): string {
        return JSON.stringify({
            id: this.type.toLowerCase() + '-' + entityId,
            name: entityName,
        });
    }

    getDefaultExtensionsContent() {
        return {};
    }
}
