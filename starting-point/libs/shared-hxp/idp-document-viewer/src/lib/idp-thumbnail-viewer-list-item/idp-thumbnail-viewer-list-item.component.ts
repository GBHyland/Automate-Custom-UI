/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ElementRef, HostBinding, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';

@Component({
    selector: 'hyland-idp-thumbnail-viewer-list-item',
    standalone: true,
    imports: [CommonModule, MatListModule],
    template: '<mat-list-item><ng-content/></mat-list-item>',
})
export class IdpThumbnailViewerListItemComponent {
    @HostBinding('attr.role') role = 'list-item';
    @Input() isSelected = false;

    private readonly element = inject(ElementRef);

    focus() {
        this.element.nativeElement.focus();
    }
}
