/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModelVariation } from './';

export class DataModel implements ModelVariation {
    displayName = 'DataModel';
    namePrefix = 'pw-e2e-data-model-';
    type = 'DATA';
    contentType = 'text/plain';
    contentExtension = 'json';

    getDefaultContent() {
        return '{}';
    }

    getDefaultExtensionsContent() {
        return {};
    }
}
