/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExtensionService } from '@alfresco/adf-extensions';
import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ManageVersionsButtonComponent } from './manage-versions-button/manage-versions-button.component';

export function provideManageVersions(): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: APP_INITIALIZER,
            useFactory: (extensions: ExtensionService) => () => {
                extensions.setComponents({
                    'document.manage_versions': ManageVersionsButtonComponent,
                });
            },
            deps: [ExtensionService],
            multi: true,
        },
    ]);
}
