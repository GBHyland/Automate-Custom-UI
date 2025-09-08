/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FocusableOption } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';

@Component({
    selector: 'hyland-idp-list-item',
    template: '<mat-list-item role="listitem" [activated]="isSelected" [disabled]="disabled"><ng-content /></mat-list-item>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatListModule],
})
export class ListItemComponent implements FocusableOption {
    @HostBinding('attr.tabindex') tabindex = '-1';

    @Input() isSelected = false;
    @Input() id!: string;
    @Input() index!: number;
    @Input() disabled = false;

    constructor(private readonly element: ElementRef) {}

    focus() {
        this.element.nativeElement.focus();
    }
}
