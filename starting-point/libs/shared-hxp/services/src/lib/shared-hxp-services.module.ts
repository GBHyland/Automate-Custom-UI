/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    SharedDocumentService,
    DOCUMENT_SERVICE,
    DOCUMENT_PROPERTIES_SERVICE,
    SharedDocumentPropertiesService,
} from '@alfresco/adf-hx-content-services/services';

interface SharedHxpServicesModuleConfig {
    DocumentPropertiesService: new (...args: any) => SharedDocumentPropertiesService;
    DocumentService: new (...args: any) => SharedDocumentService;
}

@NgModule({
    imports: [CommonModule],
})
export class SharedHxpServicesModule {
    static forProcess(config: SharedHxpServicesModuleConfig): ModuleWithProviders<SharedHxpServicesModule> {
        return {
            ngModule: SharedHxpServicesModule,
            providers: [
                { provide: DOCUMENT_PROPERTIES_SERVICE, useClass: config.DocumentPropertiesService },
                { provide: DOCUMENT_SERVICE, useClass: config.DocumentService },
            ],
        };
    }

    static forContent(config: SharedHxpServicesModuleConfig): ModuleWithProviders<SharedHxpServicesModule> {
        return {
            ngModule: SharedHxpServicesModule,
            providers: [
                { provide: DOCUMENT_PROPERTIES_SERVICE, useExisting: config.DocumentPropertiesService },
                { provide: DOCUMENT_SERVICE, useExisting: config.DocumentService },
            ],
        };
    }
}
