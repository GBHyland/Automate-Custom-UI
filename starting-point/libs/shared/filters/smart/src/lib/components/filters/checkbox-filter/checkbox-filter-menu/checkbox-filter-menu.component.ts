/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Option } from '@alfresco-dbp/shared-filters-services';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
    selector: 'hxp-checkbox-filter-menu',
    standalone: true,
    imports: [MatDividerModule, MatButtonModule, MatCheckboxModule, TranslatePipe, A11yModule],
    templateUrl: './checkbox-filter-menu.component.html',
    styleUrls: ['./checkbox-filter-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFilterMenuComponent {
    @Input() options: Option[] = [];
    @Output() update: EventEmitter<Option[]> = new EventEmitter<Option[]>();

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.onUpdate();
        }
    }

    get selectedOptions(): Option[] {
        return this.options.filter((o) => o.checked);
    }

    get someSelected(): boolean {
        return this.selectedOptions.length > 0 && !this.allSelected;
    }

    get allSelected(): boolean {
        return this.selectedOptions.length === this.options.length;
    }

    selectAll(selected: boolean): void {
        for (const o of this.options) {
            o.checked = selected;
        }
    }

    onCheckboxChange(option: Option): void {
        const foundOption = this.options.find((o) => o.value === option.value);
        if (foundOption) {
            foundOption.checked = !option.checked;
        }
    }

    onClearSelection(): void {
        for (const o of this.options) {
            o.checked = false;
        }
    }

    onUpdate(): void {
        this.update.emit(this.selectedOptions);
    }
}
