/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Param, ParamOptions } from '../../cli';
import { InputParam } from '../../cli/input-param';
import { ConfirmParam } from '../../cli/confirm-param';
import { ListParamOptions, ListParam } from '../../cli/list-param';

// eslint-disable-next-line @typescript-eslint/ban-types
type Constructor<T> = Function & (new (...args: any[]) => T);
export const inputParamsTable = Symbol('inputParams');

export const InputParamDecorator = getDecoratorFunction<ParamOptions>(InputParam);
export const ConfirmParamDecorator = getDecoratorFunction<ParamOptions>(ConfirmParam);
export const ListParamDecorator = getDecoratorFunction<ListParamOptions>(ListParam);

function getDecoratorFunction<T extends ParamOptions>(ParamType: Constructor<Param>) {
    return function (decoratedParamConfig: Omit<T, 'name' | 'value'>) {
        return function (target, propertyKey: string) {
            if (!target[inputParamsTable]) {
                Object.defineProperty(target, inputParamsTable, {
                    enumerable: false,
                    configurable: true,
                    value: {},
                });
            }

            target[inputParamsTable][propertyKey] = new ParamType({
                name: propertyKey,
                ...decoratedParamConfig,
            });

            Object.defineProperty(target, propertyKey, {
                get: () => target[inputParamsTable][propertyKey].value,
                set: (value) => {
                    target[inputParamsTable][propertyKey].value = value;
                },
            });
        };
    };
}
