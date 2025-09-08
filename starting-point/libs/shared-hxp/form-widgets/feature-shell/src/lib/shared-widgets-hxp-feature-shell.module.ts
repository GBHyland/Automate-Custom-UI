/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CoreModule } from '@alfresco/adf-core';
import { PropertiesViewerContainerComponent } from '@alfresco/adf-hx-content-services/ui';
import { AttachFileWidgetComponent } from './widgets/attach-file/attach-file.widget';
import { FileViewerWidgetComponent } from './widgets/file-viewer/file-viewer.widget';
import { PropertiesViewerWidgetComponent } from './widgets/properties-viewer/properties-viewer.widget';
import { FormWidgetService } from './services/form-widget/form-widget.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ADF_HX_CONTENT_SERVICES_API_PROVIDERS } from '@alfresco/adf-hx-content-services/api';
import { FORM_CLOUD_FIELD_VALIDATORS_TOKEN } from '@alfresco/adf-process-services-cloud';
import { FormWidgetsFieldValidator } from './services/validators/form-widgets-field-validator';

@NgModule({
    imports: [
        CommonModule,
        CoreModule,
        MatIconModule,
        MatTooltipModule,
        MatTableModule,
        MatMenuModule,
        AttachFileWidgetComponent,
        FileViewerWidgetComponent,
        PropertiesViewerWidgetComponent,
        PropertiesViewerContainerComponent,
    ],
    providers: [
        ...ADF_HX_CONTENT_SERVICES_API_PROVIDERS,
        FormWidgetService,
        {
            provide: FORM_CLOUD_FIELD_VALIDATORS_TOKEN,
            useClass: FormWidgetsFieldValidator,
            multi: true,
        },
    ],
    exports: [AttachFileWidgetComponent, FileViewerWidgetComponent, PropertiesViewerWidgetComponent],
})
export class SharedWidgetsHxpFeatureShellModule {}
