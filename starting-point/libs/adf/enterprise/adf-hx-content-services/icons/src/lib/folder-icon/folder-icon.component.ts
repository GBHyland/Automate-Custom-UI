/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input } from '@angular/core';
import { MimeTypeIconComponent } from '../mime-type-icon/mime-type-icon.component';
import { DefaultIcon } from '../configs/icons.config';

/**
 * Component representing a folder icon.
 *
 * To use the `FolderIconComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { FolderIconComponent } from '@alfresco/adf-hx-content-services/icons';
 * @NgModule({
 *     imports: [
 *         FolderIconComponent,
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
 * <hxp-folder-icon [isExpanded]="false"></hxp-folder-icon>
 */
@Component({
    selector: 'hxp-folder-icon',
    templateUrl: './folder-icon.component.html',
    standalone: true,
    imports: [MimeTypeIconComponent],
})
export class FolderIconComponent {
    /**
     * Indicates whether the folder is expanded.
     * @type {boolean}
     */
    @Input()
    isExpanded = false;

    protected readonly folderIcon: DefaultIcon = 'folder';
    protected readonly openFolderIcon: DefaultIcon = 'openFolder';
}
