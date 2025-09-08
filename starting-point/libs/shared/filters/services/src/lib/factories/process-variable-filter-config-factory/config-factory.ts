/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { CreateProcessVariableConfigFilterStrategy } from './strategies/base-config-strategy';
import { ProcessStringFilterConfigStrategy } from './strategies/string-config-filter-strategy';
import { ProcessNumberFilterConfigStrategy } from './strategies/number-config-filter.strategy';
import { ProcessDateFilterConfigStrategy } from './strategies/date-config.strategy';
import { ProcessBooleanFilterConfigStrategy } from './strategies/boolean-config-strategy';
import { DateCloudFilterType } from '@alfresco/adf-process-services-cloud';
import { ProcessVariableFilterModelExtension, VariableByProcess } from '../interfaces';
import { ProcessVariableFilterConfig } from '../../filter/filter-models/process-variables-filters';

@Injectable({ providedIn: 'root' })
export class ProcessVariableConfigFactory {
    createConfigs(
        processVariableFilters: ProcessVariableFilterModelExtension[],
        allProcessesVariable: VariableByProcess[]
    ): ProcessVariableFilterConfig[] {
        const filterConfigs = allProcessesVariable.map((processWithVariable) => {
            let configCreator: CreateProcessVariableConfigFilterStrategy | undefined;

            const processId = processWithVariable.process.id;
            const variableId = processWithVariable.variable.id;

            const isVariableDisplayNameDuplicated = allProcessesVariable.some((otherProcess) => {
                const isTheSameProcess = otherProcess.process.id === processId;

                if (isTheSameProcess) {
                    return false;
                }

                return otherProcess.variable.displayName === processWithVariable.variable.displayName && otherProcess.variable.id !== variableId;
            });

            const alreadyCreatedFilterForVariables = processVariableFilters.filter(
                (processVariableFilter): processVariableFilter is ProcessVariableFilterModelExtension => {
                    return (
                        processVariableFilter.processDefinitionKey === processWithVariable.process.key &&
                        processVariableFilter.name === processWithVariable.variable.name
                    );
                }
            );

            switch (processWithVariable.variable.type) {
                case 'string': {
                    configCreator = new ProcessStringFilterConfigStrategy(
                        processWithVariable.process,
                        processWithVariable.variable,
                        alreadyCreatedFilterForVariables,
                        {
                            showDescription: isVariableDisplayNameDuplicated,
                        }
                    );
                    break;
                }
                case 'integer':
                case 'bigdecimal': {
                    configCreator = new ProcessNumberFilterConfigStrategy(
                        processWithVariable.process,
                        processWithVariable.variable,
                        alreadyCreatedFilterForVariables,
                        {
                            showDescription: isVariableDisplayNameDuplicated,
                        }
                    );

                    break;
                }
                case 'date':
                case 'datetime': {
                    configCreator = new ProcessDateFilterConfigStrategy(
                        processWithVariable.process,
                        processWithVariable.variable,
                        alreadyCreatedFilterForVariables as ProcessVariableFilterModelExtension<DateCloudFilterType>[],
                        {
                            showDescription: isVariableDisplayNameDuplicated,
                        }
                    );
                    break;
                }
                case 'boolean': {
                    configCreator = new ProcessBooleanFilterConfigStrategy(
                        processWithVariable.process,
                        processWithVariable.variable,
                        alreadyCreatedFilterForVariables,
                        {
                            showDescription: isVariableDisplayNameDuplicated,
                        }
                    );
                    break;
                }
            }

            return configCreator ? configCreator.create() : undefined;
        });

        return filterConfigs.filter((config): config is ProcessVariableFilterConfig => !!config);
    }
}
