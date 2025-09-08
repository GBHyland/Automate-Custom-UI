/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { logger } from './node-logger';
import { AppNames } from '../config';

export const getExcludedTestsRegExpArray = (excludedJson: any, appName: AppNames) => {
    const prefix = `[ 🎭 Playwright Excludes - ${appName} ]`;
    const objectKeys = Object.keys(excludedJson);

    if (objectKeys.length === 0) {
        logger.info(`${prefix} ✅ No excluded tests 🎉 `);
    } else {
        logger.warn(`${prefix} ❌ Tests excluded because of 🐛 : ${objectKeys}`);
    }

    return objectKeys.map((key) => new RegExp(key));
};
