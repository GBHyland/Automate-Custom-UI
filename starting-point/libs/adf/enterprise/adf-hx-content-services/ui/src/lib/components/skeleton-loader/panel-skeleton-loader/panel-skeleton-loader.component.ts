/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, OnChanges } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
    selector: 'hxp-panel-skeleton-loader',
    standalone: true,
    imports: [NgFor],
    templateUrl: './panel-skeleton-loader.component.html',
    styleUrls: ['./panel-skeleton-loader.component.scss'],
})
export class PanelSkeletonLoaderComponent implements OnChanges {
    /**
     * Default value of skeleton panel rows to display.
     * @readonly
     * @type {number}
     */
    protected static readonly DEFAULT_SKELETON_ROWS = 10;

    /**
     * Indicates the number of rows to display in the skeleton panel.
     * @type {number}
     * @default 10
     */
    @Input()
    skeletonRows: number = PanelSkeletonLoaderComponent.DEFAULT_SKELETON_ROWS;

    protected skeletonRowArray: number[] = Array.from({ length: this.skeletonRows });

    ngOnChanges(): void {
        if (!this.skeletonRows && this.skeletonRows !== 0) {
            this.skeletonRows = PanelSkeletonLoaderComponent.DEFAULT_SKELETON_ROWS;
        }
        this.skeletonRowArray = Array.from({ length: this.skeletonRows });
    }

    protected skeletonRowTrackBy(index: number) {
        return index;
    }
}
