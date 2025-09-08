/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExtensionService } from '@alfresco/adf-extensions';
import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { DocumentMoveButtonComponent } from './document-move-button/document-move-button-component';
import { DocumentMoveButtonActionService } from './document-move-button/document-move-button-action.service';
import { provideAdfEnterpriseAdfHxContentServicesServices, HXP_DOCUMENT_MOVE_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';

export function provideSingleItemMove(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideAdfEnterpriseAdfHxContentServicesServices(),
        {
            provide: HXP_DOCUMENT_MOVE_ACTION_SERVICE,
            useClass: DocumentMoveButtonActionService,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: (extensions: ExtensionService) => () => {
                extensions.setComponents({
                    'document.move': DocumentMoveButtonComponent,
                });
            },
            deps: [ExtensionService],
            multi: true,
        },
    ]);
}
