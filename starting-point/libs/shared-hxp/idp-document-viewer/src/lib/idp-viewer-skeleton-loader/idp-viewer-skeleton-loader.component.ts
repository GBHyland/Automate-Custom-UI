/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'hyland-idp-viewer-skeleton-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div
            [class.idp-viewer-skeleton-circle]="circle"
            [class.idp-viewer-skeleton-rect]="!circle"
            [ngStyle]="{
                width: width + '%',
                height: height + '%',
                margin: margin
            }"
            class="idp-viewer-skeleton-loader"
        ></div>
    `,
    styleUrls: ['./idp-viewer-skeleton-loader.component.scss'],
})
export class IdpViewerSkeletonLoaderComponent {
    @Input() height = 50;
    @Input() width = 50;
    @Input() circle = false;
    @Input() margin = '16px';
}
