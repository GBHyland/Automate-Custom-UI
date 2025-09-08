/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { styleText } from 'node:util';
import { ParamType } from './params';

export type ParamProcessor = (value: any) => any;
export type CommanderOptionParams = [string, string, ParamProcessor?, any?] | [string, ParamProcessor?, any?];
export class ComplexCommanderOptionParams {
    constructor(public value: CommanderOptionParams[]) {}
}

type Char =
    | 'a'
    | 'b'
    | 'c'
    | 'd'
    | 'e'
    | 'f'
    | 'g'
    | 'h'
    | 'i'
    | 'j'
    | 'k'
    | 'l'
    | 'm'
    | 'n'
    | 'o'
    | 'p'
    | 'q'
    | 'r'
    | 's'
    | 't'
    | 'u'
    | 'v'
    | 'w'
    | 'x'
    | 'y'
    | 'z'
    | 'A'
    | 'B'
    | 'C'
    | 'D'
    | 'E'
    | 'F'
    | 'G'
    | 'H'
    | 'I'
    | 'J'
    | 'K'
    | 'L'
    | 'M'
    | 'N'
    | 'O'
    | 'P'
    | 'Q'
    | 'R'
    | 'S'
    | 'T'
    | 'U'
    | 'V'
    | 'W'
    | 'X'
    | 'Y'
    | 'Z';
// For help, logLevel and version
type ReservedAliases = 'h' | 'l' | 'i' | 'V';

export interface ParamOptions {
    name: string;
    alias: Exclude<Char, ReservedAliases>;
    title: string;
    required: boolean;
    value?: any;
}

export abstract class Param {
    protected type: ParamType;
    constructor(protected options: ParamOptions) {}

    abstract get commanderOption(): CommanderOptionParams | ComplexCommanderOptionParams;

    abstract get inquirerOption(): any;

    protected get formattedTitle() {
        return this.isRequired ? `${this.options.title} ${styleText('yellow', '[required]')}` : this.options.title;
    }

    protected addDefaultParamIfNeeded(optionParams: CommanderOptionParams) {
        if (this.options.value !== undefined && this.isRequired) {
            optionParams.push(this.options.value);
        }
    }

    get isRequired() {
        return this.options.required;
    }

    get name() {
        return this.options.name;
    }

    get value() {
        return this.options.value;
    }

    set value(value) {
        this.options.value = value;
    }
}
