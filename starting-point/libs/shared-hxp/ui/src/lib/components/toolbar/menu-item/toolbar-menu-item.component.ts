/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContentActionRef, DynamicExtensionComponent } from '@alfresco/adf-extensions';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'hxp-toolbar-menu-item',
    templateUrl: './toolbar-menu-item.component.html',
    standalone: true,
    imports: [CommonModule, DynamicExtensionComponent],
})
export class ToolbarMenuItemComponent {
    @Input() item?: ContentActionRef;
}
