/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIf } from '@angular/common';

@Component({
    standalone: true,
    selector: 'hxp-selected-item-count',
    templateUrl: './selected-item-count.component.html',
    styleUrls: ['./selected-item-count.component.scss'],
    imports: [NgIf, TranslatePipe],
})
export class SelectedItemCountComponent {
    @Input() selectedItems: Document[] = [];

    constructor(private documentService: DocumentService) {}

    clearSelection() {
        this.documentService.clearSelectionDocumentList();
    }
}
