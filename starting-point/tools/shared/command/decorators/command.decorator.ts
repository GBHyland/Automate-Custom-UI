/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { dirname, sep, basename } from 'node:path';
import { existsSync } from 'node:fs';

export function CommandDecorator({ name, description }: { name: string; description: string }) {
    // eslint-disable-next-line
    return function classDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            description = description;
            get name() {
                if (existsSync(name)) {
                    if (/index\.ts$/.test(name)) {
                        return dirname(name).split(sep).pop();
                    } else {
                        return basename(name).replace(/\.[tj]s$/, '');
                    }
                }
                return name;
            }
        };
    };
}
