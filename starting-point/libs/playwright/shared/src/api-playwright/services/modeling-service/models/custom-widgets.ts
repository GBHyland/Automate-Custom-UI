/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModelVariation } from './';

export class CustomWidgets implements ModelVariation {
    displayName = 'Form Widgets';
    namePrefix = 'pw-e2e-aps-custom-widgets-';
    type = 'Form Widgets';
    contentType = 'application/json';
    contentExtension = 'json';

    getDefaultContent(entityName: string, entityId: string) {
        return JSON.stringify({
            id: this.type.toLowerCase() + '-' + entityId,
            name: entityName,
            'adf-template': 'content',
            plugins: [],
        });
    }

    getDefaultExtensionsContent() {
        return {};
    }
}
