/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, Input, OnChanges } from '@angular/core';
import {
    DocumentCacheService,
    ActionContext,
    DocumentActionService,
    HXP_DOCUMENT_MOVE_ACTION_SERVICE,
} from '@alfresco/adf-hx-content-services/services';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'hxp-document-move-button',
    standalone: true,
    imports: [CommonModule, TranslatePipe, MatIconModule, MatMenuModule],
    templateUrl: './document-move-button-component.html',
})
export class DocumentMoveButtonComponent implements OnChanges {
    @Input() isAvailable = false;
    @Input() data: ActionContext = { documents: [] };

    constructor(
        @Inject(HXP_DOCUMENT_MOVE_ACTION_SERVICE) private documentMoveActionService: DocumentActionService,
        private documentCache: DocumentCacheService
    ) {}

    ngOnChanges(): void {
        if (!this.data.parentDocument && this.data.documents.length > 0 && this.data.documents[0].sys_parentId) {
            this.documentCache.getDocument(this.data.documents[0].sys_parentId).subscribe({
                next: (doc) => {
                    this.data.parentDocument = doc;
                    this.isAvailable = this.documentMoveActionService.isAvailable(this.data);
                },
                error: (error) => console.error(error),
            });
        } else {
            this.isAvailable = this.documentMoveActionService.isAvailable(this.data);
        }
    }

    onMove() {
        this.documentMoveActionService.execute(this.data);
    }
}
