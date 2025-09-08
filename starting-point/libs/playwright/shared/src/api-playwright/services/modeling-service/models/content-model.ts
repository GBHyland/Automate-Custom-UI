/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModelVariation } from './';

export class ContentModel implements ModelVariation {
    displayName = 'Content Model';
    namePrefix = 'pw-e2e-content-model-';
    type = 'MODEL';
    contentType = 'text/plain';
    contentExtension = 'xml';

    getDefaultContent(name: string) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<model name="${name.replaceAll('-', '')}:${name}" xmlns="http://www.alfresco.org/model/dictionary/1.0">
    <description><![CDATA[e2e test content model]]></description>
    <author>modeler</author>
    <version>1.0</version>
    <imports>
        <import uri="http://www.alfresco.org/model/dictionary/1.0" prefix="d"/>
        <import uri="http://www.alfresco.org/model/content/1.0" prefix="cm"/>
    </imports>
    <namespaces>
        <namespace uri="http://www.alfresco.org/model/${name}" prefix="${name.replaceAll('-', '')}"/>
    </namespaces>
</model>`;
    }

    getDefaultExtensionsContent() {
        return {};
    }
}
