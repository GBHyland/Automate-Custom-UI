/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, OnChanges } from '@angular/core';
import { NgFor } from '@angular/common';

/**
 * Component representing a skeleton to display during content loading.
 *
 * To use the `TableSkeletonLoaderComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { TableSkeletonLoaderComponent } from '@alfresco/adf-hx-content-services/ui';
 * @NgModule({
 *     imports: [
 *         TableSkeletonLoaderComponent,
 *         ...
 *     ],
 *    [...]
 * })
 * export class AppModule {}
 * ```
 *
 * Then use it in your Angular template as shown in the example below:
 *
 * @example
 * <hxp-table-skeleton-loader></hxp-table-skeleton-loader>
 */
@Component({
    selector: 'hxp-table-skeleton-loader',
    standalone: true,
    imports: [NgFor],
    templateUrl: './table-skeleton-loader.component.html',
    styleUrls: ['./table-skeleton-loader.component.scss'],
})
export class TableSkeletonLoaderComponent implements OnChanges {
    /**
     * Default value of skeleton tree rows to display.
     * @readonly
     * @type {number}
     */
    protected static readonly DEFAULT_SKELETON_ROWS = 5;

    /**
     * Indicates the number of rows to display in the skeleton table.
     * @type {number}
     * @default 5
     */
    @Input()
    skeletonRows: number = TableSkeletonLoaderComponent.DEFAULT_SKELETON_ROWS;

    protected skeletonRowArray: number[] = Array.from({ length: this.skeletonRows });

    ngOnChanges(): void {
        if (!this.skeletonRows && this.skeletonRows !== 0) {
            this.skeletonRows = TableSkeletonLoaderComponent.DEFAULT_SKELETON_ROWS;
        }
        this.skeletonRowArray = Array.from({ length: this.skeletonRows });
    }

    protected skeletonRowTrackBy(index: number) {
        return index;
    }
}
