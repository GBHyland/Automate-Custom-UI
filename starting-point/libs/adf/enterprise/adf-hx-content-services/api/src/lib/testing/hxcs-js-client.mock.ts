/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, AuthenticationService } from '@alfresco/adf-core';
import { Subject } from 'rxjs';

const mockAppConfigService = {
    status: 'loaded',
    get: (key: string) => {
        return key === 'viewer'
            ? {
                  enableDownloadPrompt: false,
                  enableDownloadPromptReminder: false,
                  downloadPromptDelay: 3,
                  downloadPromptReminderDelay: 2,
              }
            : {};
    },
};

export const mockHxcsJsClientConfigurationService = [
    {
        provide: AuthenticationService,
        useValue: {
            getToken: () => 'fake token',
            onTokenReceived: new Subject<any>(),
        },
    },
    {
        provide: AppConfigService,
        useValue: mockAppConfigService,
    },
];
