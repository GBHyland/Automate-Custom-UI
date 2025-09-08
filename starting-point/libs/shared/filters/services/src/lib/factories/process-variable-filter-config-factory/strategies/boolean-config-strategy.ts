/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessVariableRadioFilterConfig } from '../../../filter/filter-models/process-variables-filters';
import { CreateProcessVariableConfigFilterStrategy } from './base-config-strategy';

export class ProcessBooleanFilterConfigStrategy extends CreateProcessVariableConfigFilterStrategy {
    create(): ProcessVariableRadioFilterConfig {
        return {
            data: {
                processDefinitionKey: this.process.key,
                variableName: this.variable.name,
                variableType: this.variable.type,
                operator: '',
            },
            options: [
                { label: 'True', value: 'true' },
                { label: 'False', value: 'false' },
            ],
            name: this.name,
            translationKey: this.translationKey,
            value: this.alreadyCreatedFilters[0]?.value
                ? {
                      label: '' + this.alreadyCreatedFilters[0].value,
                      value: '' + this.alreadyCreatedFilters[0].value,
                  }
                : null,
            visible: !!this.alreadyCreatedFilters[0]?.value,
            description: this.description,
        };
    }
}
