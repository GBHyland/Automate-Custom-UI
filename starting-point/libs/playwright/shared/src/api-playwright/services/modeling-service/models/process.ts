/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UtilRandom } from '../../../../utils';
import { ModelCustomParameters, ModelVariation } from './';

export class Process implements ModelVariation {
    displayName = 'Process';
    namePrefix = 'pw-e2e-process-';
    type = 'PROCESS';
    contentType = 'text/plain';
    contentExtension = 'xml';
    defaultEntityUUID = `Process_${UtilRandom.generateAlphaNumeric(9)}`;

    /* cSpell:disable */
    getDefaultContent(entityName: string, entityId: string, customParameters?: ModelCustomParameters): string {
        const processCategory = customParameters?.processCategory ?? '';
        const defaultContent = `<?xml version="1.0" encoding="UTF-8"?>
            <bpmn2:definitions
                xmlns:activiti="http://activiti.org/bpmn"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
                xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd"
                id="model-${entityId}"
                name="${entityName}"
                targetNamespace="${processCategory}">
              <bpmn2:process id="${this.defaultEntityUUID}" isExecutable="true" name="${entityName}">
                <bpmn2:documentation>Lorem ipsum dolor sit amet...</bpmn2:documentation>
                <bpmn2:startEvent id="Event_1"> <bpmn2:outgoing>SequenceFlow_0sobpks</bpmn2:outgoing></bpmn2:startEvent>
                <bpmn2:endEvent id="EndEvent_06va1bg"> <bpmn2:incoming>SequenceFlow_0sobpks</bpmn2:incoming></bpmn2:endEvent>
                <bpmn2:sequenceFlow id="SequenceFlow_0sobpks" sourceRef="Event_1" targetRef="EndEvent_06va1bg" />
              </bpmn2:process>
              <bpmndi:BPMNDiagram id="BPMNDiagram_1">
                <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${this.defaultEntityUUID}">
                    <bpmndi:BPMNShape id="_BPMNShape_Event_2" bpmnElement="Event_1">
                        <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/>
                    </bpmndi:BPMNShape>
                    <bpmndi:BPMNShape id="EndEvent_06va1bg_di" bpmnElement="EndEvent_06va1bg">
                        <dc:Bounds x="502" y="240" width="36" height="36" />
                    </bpmndi:BPMNShape>
                    <bpmndi:BPMNEdge id="SequenceFlow_0sobpks_di" bpmnElement="SequenceFlow_0sobpks">
                        <di:waypoint x="448" y="258" />
                        <di:waypoint x="502" y="258" />
                    </bpmndi:BPMNEdge>
                </bpmndi:BPMNPlane>
              </bpmndi:BPMNDiagram>
            </bpmn2:definitions>`;

        return defaultContent;
    }
    /* cSpell:enable */

    getDefaultExtensionsContent(customParameters?: ModelCustomParameters) {
        const entityUUID = customParameters?.entityUUID ?? this.defaultEntityUUID;
        return {
            [entityUUID]: {
                constants: {},
                mappings: {},
                properties: {},
                assignments: {},
            },
        };
    }
}
