/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Document } from '@hylandsoftware/hxcs-js-client/cjs/index';

export const DataGenerator = {
    generateFilesData(count: number, fileNamePrefix: string): Document[] {
        return Array.from({ length: count }).map((_, index) => {
            return {
                sys_title: `${fileNamePrefix}-${index}`,
                sys_description: `${fileNamePrefix}-${index}-description`,
            };
        });
    },
};
