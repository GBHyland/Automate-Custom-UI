/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
    standalone: true,
    imports: [MatIconModule, NgIf],
    selector: 'process-list-item',
    templateUrl: './process-list-item.component.html',
    styleUrls: ['./process-list-item.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessListByCategoryItemComponent {
    @Input() process;

    @Output() selectProcess = new EventEmitter();

    @HostListener('keydown.enter', [])
    onProcessListItemKeydown(): void {
        this.selectProcess.emit(this.process);
    }
}
