/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContentActionRef } from '@alfresco/adf-extensions';
import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { ActionContext, DocumentMoreMenuItemsFactoryService } from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { Observable } from 'rxjs';
import { ToolbarComponent } from '@alfresco/adf-core';
import { SelectedItemCountComponent } from '../selected-item-count/selected-item-count.component';
import {
    ContentDeleteButtonComponent,
    ContentPropertiesViewerButtonComponent,
    ContentShareButtonComponent,
    DocumentMoreActionComponent,
    ManageColumnButtonComponent,
    SingleItemDownloadButtonComponent,
} from '@alfresco/adf-hx-content-services/ui';
import { AsyncPipe } from '@angular/common';

@Component({
    standalone: true,
    selector: 'hxp-document-action-toolbar',
    templateUrl: './document-action-toolbar.component.html',
    styleUrls: ['./document-action-toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        AsyncPipe,
        ToolbarComponent,
        SelectedItemCountComponent,
        ContentPropertiesViewerButtonComponent,
        ContentDeleteButtonComponent,
        SingleItemDownloadButtonComponent,
        ContentShareButtonComponent,
        ManageColumnButtonComponent,
        DocumentMoreActionComponent,
    ],
})
export class DocumentActionToolbarComponent implements OnChanges {
    @Input() actionContext: ActionContext;
    @Input() selection: Document[] = [];

    moreMenu$: Observable<ContentActionRef>;

    constructor(private menuItemsFactoryService: DocumentMoreMenuItemsFactoryService) {
        this.moreMenu$ = this.menuItemsFactoryService.getMoreMenuItems();
    }

    ngOnChanges(): void {
        this.actionContext = {
            ...this.actionContext,
            documents: this.selection,
        };
    }
}
