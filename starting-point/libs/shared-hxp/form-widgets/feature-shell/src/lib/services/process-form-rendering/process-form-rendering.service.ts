/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { CloudFormRenderingService } from '@alfresco/adf-process-services-cloud';
import { FileViewerWidgetComponent, PropertiesViewerWidgetComponent, AttachFileWidgetComponent } from '../../widgets';

export enum FormWidgetTypes {
    FileViewer = 'hxp-file-viewer',
    PropertiesViewer = 'hxp-properties-viewer',
    AttachFile = 'hxp-upload',
}

@Injectable()
export class ProcessFormRenderingService extends CloudFormRenderingService {
    constructor() {
        super();

        this.register(
            {
                [FormWidgetTypes.FileViewer]: () => FileViewerWidgetComponent,
                [FormWidgetTypes.PropertiesViewer]: () => PropertiesViewerWidgetComponent,
                [FormWidgetTypes.AttachFile]: () => AttachFileWidgetComponent,
            },
            true
        );
    }
}
