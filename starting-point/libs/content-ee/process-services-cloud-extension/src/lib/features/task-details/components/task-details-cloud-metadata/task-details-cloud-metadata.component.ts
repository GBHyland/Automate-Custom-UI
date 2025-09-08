/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input } from '@angular/core';
import { InfoDrawerButtonsDirective, InfoDrawerComponent, InfoDrawerTabComponent } from '@alfresco/adf-core';
import { TaskHeaderCloudComponent } from '@alfresco/adf-process-services-cloud';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    standalone: true,
    imports: [InfoDrawerButtonsDirective, TaskHeaderCloudComponent, TranslatePipe, InfoDrawerTabComponent, InfoDrawerComponent],
    selector: 'apa-task-details-cloud-metadata',
    templateUrl: './task-details-cloud-metadata.component.html',
    styleUrls: ['./task-details-cloud-metadata.component.scss'],
})
export class TaskDetailsCloudMetadataComponent {
    @Input() appName: string;

    @Input() taskId: string;
}
