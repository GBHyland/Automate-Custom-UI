/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContentActionRef, DynamicExtensionComponent } from '@alfresco/adf-extensions';
import { Component, Input, OnInit } from '@angular/core';
import { ActionContext } from '@alfresco/adf-hx-content-services/services';
import { NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
    selector: 'hxp-document-more-menu-item',
    templateUrl: './document-more-menu-item.component.html',
    standalone: true,
    imports: [NgSwitch, NgSwitchCase, DynamicExtensionComponent],
})
export class DocumentMoreMenuItemComponent implements OnInit {
    @Input() item?: ContentActionRef;
    @Input() actionContext: ActionContext = { documents: [] };

    protected appComponent!: string;

    ngOnInit() {
        this.appComponent = this.item?.component ?? '';
    }
}
