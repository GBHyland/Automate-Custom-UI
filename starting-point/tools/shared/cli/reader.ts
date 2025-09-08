/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import commander, { program } from 'commander';
import { Inquirer } from 'inquirer';
import { ComplexCommanderOptionParams, Param } from './param';

export class Reader {
    private commander: commander.Command;

    constructor(private inquirer: Inquirer, name: string, description: string, version: string) {
        this.commander = program;

        this.commander
            .name(name)
            .usage('[options]')
            .description(description)
            .version(version)
            .option('-i, --interactive', 'Prompt for all parameters');
    }

    async *getReader(commandParams: Param[], nodeCliArgs: string[]): AsyncGenerator {
        const paramsProvidedFromCli = this.getCliProvidedParams(commandParams, nodeCliArgs);
        yield paramsProvidedFromCli;

        const missingRequiredParams = await this.getMissingRequiredParamsByInquiring(commandParams);

        const everyProvidedParam = {
            ...paramsProvidedFromCli,
            ...missingRequiredParams,
            logLevel: this.commander.opts().logLevel,
        };

        return everyProvidedParam;
    }

    private getCliProvidedParams(commandParams: Param[], nodeCliArgs: string[]) {
        commandParams.forEach((param) => {
            const commanderOptions =
                param.commanderOption instanceof ComplexCommanderOptionParams ? param.commanderOption.value : [param.commanderOption];

            commanderOptions.forEach((commanderOption) => {
                // eslint-disable-next-line prefer-spread
                this.commander.option.apply(this.commander, commanderOption);
            });
        });
        this.commander.parse(nodeCliArgs);

        return commandParams
            .filter((param) => this.commander.opts()[param.name] !== undefined)
            .reduce((paramsAcc, param) => ({ ...paramsAcc, [param.name]: this.commander.opts()[param.name] }), {});
    }

    private async getMissingRequiredParamsByInquiring(commandParams: Param[]): Promise<any> {
        let missingRequiredParams = [];

        if (this.commander.opts().interactive) {
            missingRequiredParams = commandParams.map((param) => param.inquirerOption);
        } else {
            missingRequiredParams = commandParams
                .filter((param) => param.isRequired && this.commander.opts()[param.name] === undefined)
                .map((param) => param.inquirerOption);
        }

        return this.inquirer.prompt(missingRequiredParams);
    }
}
