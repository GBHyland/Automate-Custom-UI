/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessDefinitionCloud, ProcessVariableDefinition } from '@alfresco/adf-process-services-cloud';
import { ProcessVariableFilterModelExtension } from '../../interfaces';
import { ProcessVariableFilterConfig } from '../../../filter/filter-models/process-variables-filters';

export interface CreateProcessVariableConfigFilterStrategyOptions {
    showDescription?: boolean;
}

export abstract class CreateProcessVariableConfigFilterStrategy<T = unknown> {
    name: string;
    translationKey: string;
    description?: string;

    constructor(
        protected process: ProcessDefinitionCloud,
        protected variable: ProcessVariableDefinition,
        protected alreadyCreatedFilters: ProcessVariableFilterModelExtension<T>[],
        protected options: CreateProcessVariableConfigFilterStrategyOptions = {}
    ) {
        const variableName = this.variable.displayName ?? this.variable.name;
        const processName = this.process.name;

        this.name = `${variableName}${processName ? '-' + processName : ''}`;
        this.translationKey = variableName;

        if (this.options.showDescription) {
            this.description = this.process.name;
        }
    }

    abstract create(): ProcessVariableFilterConfig;
}
