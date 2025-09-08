/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { resolve } from 'node:path';
import * as JSON5 from 'json5';
import { readFileSync } from 'node:fs';

export function getConfigContexts(): Promise<Record<string, any>> {
    const path = resolve(process.cwd(), 'config', 'contexts.json5');
    return JSON5.parse(readFileSync(path, 'utf8'));
}
