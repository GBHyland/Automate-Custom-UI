/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Option } from '@alfresco-dbp/shared-filters-services';
import { MatRadioModule } from '@angular/material/radio';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
    selector: 'hxp-radio-filter-menu',
    standalone: true,
    imports: [CommonModule, MatDividerModule, MatButtonModule, MatRadioModule, TranslatePipe, A11yModule],
    templateUrl: './radio-filter-menu.component.html',
    styleUrls: ['./radio-filter-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioFilterMenuComponent implements OnInit {
    @Input() selectedOption: Option | null = null;
    @Input() options: Option[] = [];
    @Input() allowEmpty = true;
    @Output() update: EventEmitter<Option | null> = new EventEmitter<Option | null>();

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.onUpdate();
        }
    }

    ngOnInit(): void {
        if (!this.selectedOption && !this.allowEmpty) {
            this.selectedOption = this.options[0];
        }
    }

    onUpdate(): void {
        this.update.emit(this.selectedOption);
    }

    trackByValue(index: number, option: Option) {
        return option.value;
    }
}
