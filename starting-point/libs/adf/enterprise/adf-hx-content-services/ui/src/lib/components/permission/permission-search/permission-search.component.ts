/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PermissionsManagementRow } from '@alfresco/adf-hx-content-services/services';
import { MatInputModule } from '@angular/material/input';
import { NgFor } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'hxp-permission-search',
    templateUrl: './permission-search.component.html',
    styleUrls: ['./permission-search.component.scss'],
    standalone: true,
    imports: [MatInputModule, MatAutocompleteModule, NgFor, MatOptionModule, MatIconModule, MatFormFieldModule],
})
export class PermissionsSearchComponent {
    @Input() placeHolder = '';

    @Input() activePermissionsManagementRows: PermissionsManagementRow[] = [];

    @Output() search: EventEmitter<string> = new EventEmitter();

    protected onKey(event: KeyboardEvent) {
        this.emit((event.target as HTMLInputElement).value);
    }

    protected emit(value: string) {
        this.search.emit(value);
    }

    protected permissionsManagementRowTrackBy(_index: number, row: PermissionsManagementRow) {
        return row.index;
    }
}
