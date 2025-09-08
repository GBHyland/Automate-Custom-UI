/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ParamType } from './params';
import { ParamOptions, CommanderOptionParams, Param } from './param';

export interface ComplexListChoice {
    name: string;
    value?: any;
    disabled?: boolean;
    short?: string;
}

export type ListChoices = string[] | number[] | ComplexListChoice[];
export type ListChoicesCallback = () => ListChoices;

export interface ListParamOptions extends ParamOptions {
    choices: ListChoices | ListChoicesCallback;
    pageSize?: number;
}

export class ListParam extends Param {
    protected type = ParamType.list;

    constructor(protected options: ListParamOptions) {
        super(options);
    }

    get commanderOption(): CommanderOptionParams {
        const optionParams: CommanderOptionParams = [`-${this.options.alias}, --${this.options.name} <${this.options.name}>`, this.formattedTitle];
        this.addDefaultParamIfNeeded(optionParams);
        return optionParams;
    }

    get inquirerOption() {
        return {
            type: this.type,
            name: this.options.name,
            message: this.options.title,
            choices: this.options.choices,
            pageSize: this.options.pageSize,
            ...(this.options.value !== undefined ? { default: this.options.value } : {}),
        };
    }
}
