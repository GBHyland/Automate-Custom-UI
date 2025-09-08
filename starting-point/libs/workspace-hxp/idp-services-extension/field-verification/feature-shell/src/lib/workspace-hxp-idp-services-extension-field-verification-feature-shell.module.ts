/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MetadataPanelComponent } from './components/metadata-panel/metadata-panel.component';
import { MetadataTableFieldComponent } from './components/metadata-table-field/metadata-table-field.component';
import { ExtractionResultComponent } from './components/extraction-result/extraction-result.component';
import { TranslateModule } from '@ngx-translate/core';
import { ExtractionTableComponent } from './components/extraction-table/extraction-table.component';
import { ExtractionViewComponent } from './components/extraction-view/extraction-view.component';
import { ActionHistoryService, ActionLinearHistoryService } from './services/action-history.service';
import { WorkspaceHxpIdpServicesExtensionSharedModule } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { FieldVerificationStoreModule } from './store/field-verification-store.module';
import { FieldVerificationScreenComponent } from './screens/field-verification-screen';
import { ScreenRenderingService } from '@alfresco/adf-process-services-cloud';
import { IdpImageLoadingService } from './services/image/idp-image-loading.service';

@NgModule({
    imports: [
        CommonModule,
        FieldVerificationStoreModule,
        MetadataPanelComponent,
        MetadataTableFieldComponent,
        ExtractionResultComponent,
        ExtractionTableComponent,
        ExtractionViewComponent,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        TranslateModule,
        WorkspaceHxpIdpServicesExtensionSharedModule,
    ],
    providers: [IdpImageLoadingService, { provide: ActionHistoryService, useClass: ActionLinearHistoryService }],
})
export class WorkspaceHxpIdpServicesFieldVerificationFeatureShellModule {
    constructor(screenRenderingService: ScreenRenderingService) {
        screenRenderingService.register(
            {
                'idp-field-verification': () => FieldVerificationScreenComponent,
            },
            true
        );
    }
}
