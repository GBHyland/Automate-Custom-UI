/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { UploadContentModel } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { NgForOf } from '@angular/common';

@Component({
    standalone: true,
    selector: 'hxp-upload-snackbar-list',
    templateUrl: './upload-snackbar-list.component.html',
    styleUrls: ['./upload-snackbar-list.component.scss'],
    imports: [NgForOf],
})
export class UploadSnackbarListComponent {
    @ContentChild(TemplateRef)
    template: any;

    @Input()
    uploadList: UploadContentModel[] = [];
}
