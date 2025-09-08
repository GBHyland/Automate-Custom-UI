/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContentActionRef } from '@alfresco/adf-extensions';
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable } from 'rxjs/internal/Observable';
import { ToolbarMenuItemComponent } from '../menu-item/toolbar-menu-item.component';
import { ToolbarMenuItemsFactoryService } from '../services/menu-items-factory.service';

@Component({
    selector: 'hxp-more-menu',
    templateUrl: './toolbar-more-menu.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, TranslatePipe, ToolbarMenuItemComponent],
})
export class ToolbarMoreMenuComponent {
    moreMenu$: Observable<ContentActionRef>;

    constructor(private menuItemsFactoryService: ToolbarMenuItemsFactoryService) {
        this.moreMenu$ = this.menuItemsFactoryService.getMoreMenuItems();
    }
}
