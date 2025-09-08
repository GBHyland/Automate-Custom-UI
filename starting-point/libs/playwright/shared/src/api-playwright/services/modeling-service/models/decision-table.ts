/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModelVariation } from './';

export class DecisionTable implements ModelVariation {
    displayName = 'Decision Table';
    namePrefix = 'pw-e2e-data-table-';
    type = 'DECISION';
    contentType = 'text/plain';
    contentExtension = 'xml';

    getDefaultContent(name: string, entityId: string) {
        const id = this.type.toLowerCase() + '-' + entityId;

        return `<?xml version="1.0" encoding="UTF-8"?>
        <definitions xmlns="http://www.omg.org/spec/DMN/20151101/dmn.xsd" id="${id}" name="${name}"
          namespace="http://activiti.org/schema/1.0/dmn" exporter="dmn-js (https://demo.bpmn.io/dmn)" exporterVersion="6.2.1">
          <decision id="Decision_${name}" name="Decision_${name}">
          <decisionTable id="DecisionTable_${name}">
            <input id="InputClause_${name}">
              <inputExpression id="LiteralExpression_${name}" typeRef="string" />
            </input>
            <output id="OutputClause_${name}" typeRef="string" />
          </decisionTable>
        </decision>
        </definitions>`;
    }

    getDefaultExtensionsContent() {
        return {};
    }
}
