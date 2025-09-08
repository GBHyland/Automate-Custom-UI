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
 * To use the `TreeSkeletonLoaderComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { TreeSkeletonLoaderComponent } from '@alfresco/adf-hx-content-services/ui';
 * @NgModule({
 *     imports: [
 *         TreeSkeletonLoaderComponent,
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
 * <hxp-tree-skeleton-loader></hxp-tree-skeleton-loader>
 */
@Component({
    selector: 'hxp-tree-skeleton-loader',
    standalone: true,
    imports: [NgFor],
    templateUrl: './tree-skeleton-loader.component.html',
    styleUrls: ['./tree-skeleton-loader.component.scss'],
})
export class TreeSkeletonLoaderComponent implements OnChanges {
    /**
     * Default value of skeleton tree rows to display.
     * @readonly
     * @type {number}
     */
    protected static readonly DEFAULT_SKELETON_ROWS = 10;

    /**
     * Indicates the number of rows to display in the skeleton tree.
     * @type {number}
     * @default 10
     */
    @Input()
    skeletonRows: number = TreeSkeletonLoaderComponent.DEFAULT_SKELETON_ROWS;

    protected skeletonRowArray: number[] = Array.from({ length: this.skeletonRows });

    ngOnChanges(): void {
        if (!this.skeletonRows && this.skeletonRows !== 0) {
            this.skeletonRows = TreeSkeletonLoaderComponent.DEFAULT_SKELETON_ROWS;
        }
        this.skeletonRowArray = Array.from({ length: this.skeletonRows });
    }

    protected skeletonRowTrackBy(index: number) {
        return index;
    }
}
