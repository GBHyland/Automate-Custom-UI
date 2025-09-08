/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModelVariation } from './';

export class Agent implements ModelVariation {
    displayName = 'Agent';
    namePrefix = 'pw-e2e-script-';
    type = 'AGENT';
    contentType = 'application/octet-stream';
    contentExtension = 'bin';

    getDefaultContent(entityName: string, entityId: string): string {
        return JSON.stringify({
            id: this.type.toLowerCase() + '-' + entityId,
            name: entityName,
            type: 'reasoning',
            behaviorAndConstraints: '',
            model: 'anthropic.claude-sonnet-4-20250514-v1:0',
        });
    }

    getDefaultExtensionsContent() {
        return {};
    }
}
