/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExtensionService } from '@alfresco/adf-extensions';
import { HXP_DOCUMENT_COPY_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { DocumentCopyButtonComponent } from './document-copy-button/document-copy-button-component';
import { CopyButtonActionService } from './document-copy-button/document-copy-button-action.service';

export function provideSingleItemCopy(): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: HXP_DOCUMENT_COPY_ACTION_SERVICE,
            useClass: CopyButtonActionService,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: (extensions: ExtensionService) => () => {
                extensions.setComponents({
                    'document.copy': DocumentCopyButtonComponent,
                });
            },
            deps: [ExtensionService],
            multi: true,
        },
    ]);
}
