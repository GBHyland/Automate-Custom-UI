/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'hxp-results-paginator',
    standalone: true,
    imports: [TranslatePipe, FormsModule, MatSelectModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatOptionModule, CommonModule],
    templateUrl: './results-paginator.component.html',
    styleUrl: './results-paginator.component.scss',
})
export class ResultsPaginatorComponent {
    @Input() pageSize!: number;
    @Input() pageSizeOptions = [25, 50, 100];
    @Input() previousDisabled = true;
    @Input() nextDisabled = true;

    @Output() pageSizeChange = new EventEmitter<number>();
    @Output() nextPage = new EventEmitter<void>();
    @Output() previousPage = new EventEmitter<void>();

    onPageSizeChange(size: number): void {
        this.pageSizeChange.emit(size);
    }

    loadNextPage(): void {
        this.nextPage.emit();
    }

    loadPreviousPage(): void {
        this.previousPage.emit();
    }
}
