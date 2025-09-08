/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModelVariation } from './';

export class SecurityPolicy implements ModelVariation {
    displayName = 'Security Policy';
    namePrefix = 'pw-e2e-security-policy-';
    type = 'SECURITY_POLICY';
    contentType = 'application/json';
    contentExtension = 'json';

    getDefaultContent() {
        return JSON.stringify({
            description: '',
            allOf: [],
        });
    }

    getDefaultExtensionsContent() {
        return {};
    }
}
