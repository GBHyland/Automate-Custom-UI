/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService } from '@alfresco/adf-core';
import { StoragePrefixFactory } from './storage-prefix.factory';
import { of } from 'rxjs';

type TestAppConfigService = Pick<AppConfigService, 'select'>;

describe('StoragePrefixFactory', () => {
    it('should get prefix from deployed apps from app.config.json', () => {
        const deployedAppName = 'test-app';

        const appConfigService: TestAppConfigService = {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            select(_property: string) {
                return of<Array<{ name: string }>>([{ name: deployedAppName }]);
            },
        };

        const serviceFactory = new StoragePrefixFactory(appConfigService as AppConfigService);

        serviceFactory.getPrefix().subscribe((prefix) => {
            expect(prefix).toBe(deployedAppName);
        });
    });

    it('should work, when there are no deployed apps', () => {
        const appConfigService: TestAppConfigService = {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            select(_property: string) {
                return of<Array<{ name: string }>>([]);
            },
        };

        const serviceFactory = new StoragePrefixFactory(appConfigService as AppConfigService);

        serviceFactory.getPrefix().subscribe((prefix) => {
            expect(prefix).toBe(undefined);
        });
    });
});
