/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    AfterContentInit,
    Component,
    ContentChildren,
    DestroyRef,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    QueryList,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataColumnComponent } from './data-column.component';
import { TranslatePipe } from '@ngx-translate/core';
import { GovernanceRecord } from '../../../mocks/record.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-record-list',
    standalone: true,
    templateUrl: './record-list.component.html',
    styleUrls: ['./record-list.component.scss'],
    imports: [CommonModule, MatTableModule, MatSortModule, MatCheckboxModule, MatButtonModule, MatIconModule, TranslatePipe],
})
export class RecordListComponent implements OnChanges, AfterContentInit {
    @Input() records: GovernanceRecord[] = [];
    @Input() selectAllEnabled = true;
    @Input() sorting: Sort = { active: '', direction: '' };

    @Output() selectionChanged = new EventEmitter<GovernanceRecord[]>();
    @Output() sortingChanged = new EventEmitter<Sort>();

    protected dataSource = new MatTableDataSource<GovernanceRecord>();
    protected selection = new SelectionModel<GovernanceRecord>(true, []);
    protected displayedColumns: string[] = [];

    @ViewChild(MatSort, { static: true }) protected sort!: MatSort;
    @ContentChildren(DataColumnComponent) protected projectedColumns!: QueryList<DataColumnComponent>;

    private readonly destroyRef = inject(DestroyRef);

    ngOnChanges() {
        this.updateDataSource();
        this.resetSelection();
    }

    ngAfterContentInit() {
        this.displayedColumns = ['select', ...this.projectedColumns.map((col) => col.key)];

        this.sort.sortChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((sortEvent: Sort) => {
            this.sorting = sortEvent;
            this.handleSortingChanged(sortEvent);
        });
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected > 0 && numSelected === numRows;
    }

    selectAll() {
        this.selection.select(...this.dataSource.data);
        this.selectionChanged.emit(this.selection.selected);
    }

    clearSelection() {
        this.selection.clear();
        this.selectionChanged.emit(this.selection.selected);
    }

    toggleAllRowsSelection() {
        if (this.isAllSelected()) {
            this.selection.clear();
        } else {
            this.selection.select(...this.dataSource.data);
        }
        this.selectionChanged.emit(this.selection.selected);
    }

    private updateDataSource() {
        this.dataSource.data = this.records;

        if (this.sort) {
            this.dataSource.sort = this.sort;
            this.sort.active = this.sorting.active;
            this.sort.direction = this.sorting.direction;
            this.dataSource.sortData = (data) => data;
        }
    }

    protected toggleRowSelection(row: GovernanceRecord) {
        this.selection.toggle(row);
        this.selectionChanged.emit(this.selection.selected);
    }

    protected handleSortingChanged(sortingEvent: Sort): void {
        const { active, direction } = sortingEvent;
        if (active && direction) {
            this.sortingChanged.emit(sortingEvent);
        }
    }

    protected resetSorting() {
        this.sort.active = '';
        this.sort.direction = '';
        this.sort.sortChange.emit({ active: '', direction: '' });
    }

    protected resetSelection() {
        this.selection.clear();
        this.selectionChanged.emit([]);
    }
}
