/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ParamType } from './params';
import { Param, CommanderOptionParams } from './param';

export class InputParam extends Param {
    protected type = ParamType.input;

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
            ...(this.options.value !== undefined ? { default: this.options.value } : {}),
        };
    }
}
