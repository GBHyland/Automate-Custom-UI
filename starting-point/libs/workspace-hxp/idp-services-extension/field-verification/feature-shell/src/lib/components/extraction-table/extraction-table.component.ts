/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    Output,
    Pipe,
    PipeTransform,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { IdpFieldDataType } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { IdpField, IdpTable, IdpTableRowRecord } from '../../models/screen-models';
import { BehaviorSubject, filter, map, Observable, switchMap, take } from 'rxjs';
import { BasicOcrWord, findSingleTypeaheadMatch, IdpVerificationService } from '../../services/verification/verification.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { ActionHistoryService } from '../../services/action-history.service';
import { FormsModule } from '@angular/forms';

@Pipe({ name: 'withRowNumberColumn', pure: true, standalone: true })
export class WithRowNumberColumnPipe implements PipeTransform {
    transform(columns: string[]) {
        return ['rowNumber', ...columns];
    }
}

@Component({
    selector: 'hyland-idp-extraction-table',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatTableModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        TranslatePipe,
        WithRowNumberColumnPipe,
    ],
    templateUrl: './extraction-table.component.html',
    styleUrl: './extraction-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ExtractionTableComponent implements AfterViewInit, OnDestroy {
    @ViewChildren('extractionTableInput') metadataTableInputs!: QueryList<ElementRef<HTMLInputElement>>;
    @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger | undefined;
    @ViewChildren('rowMenuTrigger') rowMenuTriggers!: QueryList<MatMenuTrigger>;
    @ViewChildren('columnMenuTrigger') columnMenuTriggers!: QueryList<MatMenuTrigger>;
    @ViewChild('tableMenuTrigger') tableMenuTrigger!: MatMenuTrigger;

    @Input() ocrWords = new Array<BasicOcrWord>();
    @Output() readonly closeTable = new EventEmitter<void>();
    @Output() readonly fieldValuePending = new EventEmitter<{ field: IdpField; pendingValue: string }>();

    readonly table$: Observable<IdpTable | undefined>;

    blankTable = Array.from({ length: 5 }, () => ({ rowCells: [] }));
    selectedRowIndex = -1;
    selectedColumnIndex = -1;
    tableSelected = false;
    singleCellFocus = false;

    private readonly viewInitialized$ = new BehaviorSubject<boolean>(false);
    private lastKeyDownEvent?: KeyboardEvent;

    private currentTableId = '';

    private readonly verificationService = inject(IdpVerificationService);
    private readonly history = inject(ActionHistoryService);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        this.table$ = this.verificationService.activeTable$.pipe(takeUntilDestroyed(this.destroyRef));

        this.verificationService.activeField$
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                switchMap((field) =>
                    this.viewInitialized$.pipe(
                        filter((v) => v),
                        map(() => field)
                    )
                )
            )
            .subscribe((field) => {
                if (!field) {
                    return;
                }

                const tableId = field.dataType === IdpFieldDataType.Table ? field.id : field.tableId;
                const switchedTable = tableId !== this.currentTableId;
                this.currentTableId = tableId ?? '';

                if (switchedTable && !tableId) {
                    this.onCloseTable();
                    return;
                }
                if (field.dataType !== IdpFieldDataType.Table && field.needsKeyboardFocus) {
                    const focusedCell = this.metadataTableInputs.find((input) => input.nativeElement.id === field.id)?.nativeElement;
                    if (focusedCell) {
                        focusedCell.focus();
                        return;
                    }
                }
                if (tableId && field.dataType === IdpFieldDataType.Table) {
                    setTimeout(() => this.focusFirstCell(), 0);
                    return;
                }
            });
    }

    focusFirstCell() {
        const firstInput = this.metadataTableInputs.first?.nativeElement;
        if (firstInput) {
            firstInput.focus();
        }
    }

    ngAfterViewInit() {
        this.viewInitialized$.next(true);
        setTimeout(() => this.focusFirstCell(), 0);
    }

    ngOnDestroy() {
        this.viewInitialized$.next(false);
    }

    onCloseTable() {
        this.closeTable.emit();
    }

    onKeydown(field: IdpField, event: KeyboardEvent) {
        this.lastKeyDownEvent = event;
        event.stopPropagation(); // Prevent keyboard shortcuts from propagating to parent components

        const currentInput = event.target as HTMLInputElement;
        const currentCell = currentInput.closest('td');
        if (currentCell) {
            const currentRow = currentCell?.parentElement as HTMLTableRowElement;
            const currentRowIndex = [...(currentRow?.parentElement?.children || [])].indexOf(currentRow);
            const currentCellIndex = [...(currentRow?.children || [])].indexOf(currentCell);

            let targetInput: HTMLInputElement | null = null;

            switch (event.key) {
                case 'PageDown': {
                    const nextRow = currentRow?.parentElement?.children[currentRowIndex + 1] as HTMLTableRowElement;
                    targetInput = nextRow?.children[currentCellIndex]?.querySelector('input');
                    break;
                }
                case 'PageUp': {
                    const previousRow = currentRow?.parentElement?.children[currentRowIndex - 1] as HTMLTableRowElement;
                    targetInput = previousRow?.children[currentCellIndex]?.querySelector('input');
                    break;
                }
                case 'Home': {
                    targetInput = currentRow?.children[currentCellIndex - 1]?.querySelector('input');
                    break;
                }
                case 'End': {
                    targetInput = currentRow?.children[currentCellIndex + 1]?.querySelector('input');
                    break;
                }
                case 'Enter': {
                    // update table status to Verified
                    if (this.currentTableId) {
                        this.verificationService.verifyField(this.currentTableId);
                    }
                    // update table field value
                    this.onFieldFocusOut(field, currentInput.value);
                    event.preventDefault();
                    this.verificationService.selectNextField();
                    break;
                }
                case '~': {
                    if (event.ctrlKey && event.shiftKey) {
                        if (this.selectedRowIndex >= 0) {
                            const rowTrigger = this.rowMenuTriggers.toArray()[this.selectedRowIndex];
                            if (rowTrigger) {
                                rowTrigger.openMenu();
                            }
                        } else if (this.selectedColumnIndex >= 0) {
                            const columnTrigger = this.columnMenuTriggers.toArray()[this.selectedColumnIndex];
                            if (columnTrigger) {
                                columnTrigger.openMenu();
                            }
                        } else if (this.tableSelected && this.tableMenuTrigger) {
                            this.tableMenuTrigger.openMenu();
                        }
                        event.preventDefault();
                    }
                    break;
                }
            }

            if (targetInput) {
                targetInput.focus();
                event.preventDefault(); // Prevent default browser behavior for Page Up/Down
            }
        } else {
            // table missing (no undo required)
            this.verificationService.activeField$.pipe(take(1)).subscribe((tableField) => {
                if (tableField) {
                    this.verificationService.verifyField(this.currentTableId);
                }
                this.verificationService.selectNextField();
            });
        }
    }

    onFieldFocus(field: IdpField) {
        if (field) {
            if (this.singleCellFocus) {
                // if the user clicked on a field, we clear the focus from the table
                this.resetGroupSelections();
            }
            // if the user clicked on a field, we want to select it
            this.singleCellFocus = true;
            this.verificationService.selectField(field);
            this.fieldValuePending.emit({ field, pendingValue: field.value ?? '' });
        }
    }

    onFieldInput(field: IdpField, input: HTMLInputElement) {
        // if the user is deleting text, we don't want to auto-complete
        const isDismissal = this.lastKeyDownEvent?.key === 'Backspace' || this.lastKeyDownEvent?.key === 'Delete';
        if (!isDismissal) {
            const userValue = input.value;
            const suggestion = findSingleTypeaheadMatch(this.ocrWords, userValue);
            if (suggestion) {
                input.value = suggestion.map((word) => word.text).join(' ');
                input.setSelectionRange(userValue.length, input.value.length);
            }
        }
        this.fieldValuePending.emit({ field, pendingValue: input.value });
    }

    onFieldFocusOut(field: IdpField, value: string): void {
        if ((field.value ?? '') === value) {
            // same value is an update (field is ManuallyReviewed), but not an undoable action
            this.verificationService.updateField(field);
        } else {
            const updatedField = { ...field, value };
            this.history.do({
                do: () => this.verificationService.updateField(updatedField),
                undo: () => this.verificationService.updateField(field),
            });
        }
    }

    getFieldStatus(field: IdpField) {
        // until the hasIssue vs. VerificationStatus is clear, return a single indicator of which icon to show
        if (field.verificationStatus === 'ManualValid') {
            return 'issueResolved';
        } else if (field.hasIssue) {
            return 'hasIssue';
        }
        return '';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    trackRow(index: number, row: IdpTableRowRecord) {
        return row.rowCells.map((field) => field.id).join(',');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    trackColumnName(index: number, columnName: string) {
        return index;
    }

    onTableMenuLeftClick(event: MouseEvent) {
        this.selectTable(event);
    }

    onTableMenuRightClick(event: MouseEvent, menuTrigger: MatMenuTrigger) {
        this.selectTable(event);
        menuTrigger.openMenu();
    }

    onRowMenuLeftClick(event: MouseEvent, rowIndex: number) {
        this.selectRow(rowIndex, event);
    }

    onRowMenuRightClick(event: MouseEvent, menuTrigger: MatMenuTrigger, rowIndex: number) {
        this.selectRow(rowIndex, event);
        menuTrigger.openMenu();
    }

    onColumnMenuLeftClick(event: MouseEvent, columnIndex: number) {
        this.selectColumn(columnIndex, event);
    }

    onColumnMenuRightClick(event: MouseEvent, menuTrigger: MatMenuTrigger, columnIndex: number) {
        this.selectColumn(columnIndex, event);
        menuTrigger.openMenu();
    }

    onClearColumn(columnIndex: number) {
        this.verificationService
            .getTableById$(this.currentTableId)
            .pipe(take(1))
            .subscribe((table) => {
                const previousColumn = table?.rows
                    ? table.rows
                          .map((row) => {
                              const cell = row.rowCells[columnIndex];
                              return cell ? { ...cell } : null;
                          })
                          .filter((cell): cell is IdpField => cell !== null)
                    : [];

                this.history.do({
                    do: () => this.verificationService.clearTableColumn(this.currentTableId, columnIndex),
                    undo: () => this.verificationService.updateTableColumn(this.currentTableId, columnIndex, previousColumn),
                });
            });
    }

    onDeleteTable() {
        this.verificationService
            .getTableById$(this.currentTableId)
            .pipe(take(1))
            .subscribe((table) => {
                if (!table) {
                    return;
                }
                // Store the entire table structure and all its field data for undo
                const deletedTable = { ...table };
                const deletedFields = table.rows.flatMap((row) => row.rowCells.map((cell) => ({ ...cell })));

                this.history.do({
                    do: () => {
                        this.verificationService.deleteTable(this.currentTableId);
                        setTimeout(() => {
                            this.verificationService.selectNextField();
                        }, 0);
                    },
                    undo: () => {
                        this.verificationService.restoreTable(this.currentTableId, deletedTable, deletedFields);
                        setTimeout(() => {
                            this.verificationService.selectField(this.currentTableId, true);
                        }, 0);
                    },
                });
            });
    }

    private handleInsertRow(insertIndex: number, focusRowIndex: number) {
        let insertedRowCells: IdpField[] = [];
        this.history.do({
            do: () => {
                if (insertedRowCells.length > 0) {
                    this.verificationService.insertTableRow(this.currentTableId, insertIndex, insertedRowCells);
                } else {
                    this.verificationService.addTableRow(this.currentTableId, insertIndex);
                }
                setTimeout(() => {
                    const rowFirstCell = this.metadataTableInputs
                        .toArray()
                        .find((input) => input.nativeElement.closest('tr')?.rowIndex === focusRowIndex);
                    rowFirstCell?.nativeElement.focus();
                }, 0);
            },
            undo: () => {
                this.verificationService
                    .getTableById$(this.currentTableId)
                    .pipe(take(1))
                    .subscribe((table) => {
                        const row = table?.rows[insertIndex];
                        // Can't get from here, as it is the old table data
                        insertedRowCells = row ? row.rowCells.map((cell) => ({ ...cell })) : [];
                        this.verificationService.deleteTableRow(this.currentTableId, insertIndex);
                        const rowFirstCell = this.metadataTableInputs
                            .toArray()
                            .find((input) => input.nativeElement.closest('tr')?.rowIndex === insertIndex);
                        if (rowFirstCell) {
                            rowFirstCell.nativeElement.focus();
                        }
                    });
            },
        });
    }

    onRowAction(rowAction: 'insertRowAbove' | 'insertRowBelow' | 'clearRow' | 'deleteRow') {
        switch (rowAction) {
            case 'insertRowAbove': {
                const insertIndex = this.selectedRowIndex;
                const focusRowIndex = insertIndex + 1;
                this.handleInsertRow(insertIndex, focusRowIndex);
                break;
            }
            case 'insertRowBelow': {
                const insertIndex = this.selectedRowIndex + 1;
                const focusRowIndex = insertIndex + 1;
                this.handleInsertRow(insertIndex, focusRowIndex);
                break;
            }
            case 'clearRow': {
                this.verificationService
                    .getTableById$(this.currentTableId)
                    .pipe(take(1))
                    .subscribe((table) => {
                        const rowIndex = this.selectedRowIndex;
                        const previousRow = table?.rows[rowIndex]?.rowCells?.map((cell) => ({ ...cell })) ?? [];
                        this.history.do({
                            do: () => this.verificationService.clearTableRow(this.currentTableId, rowIndex),
                            undo: () => this.verificationService.updateTableRow(this.currentTableId, rowIndex, previousRow),
                        });
                    });
                break;
            }
            case 'deleteRow': {
                this.verificationService
                    .getTableById$(this.currentTableId)
                    .pipe(take(1))
                    .subscribe((table) => {
                        const rowToDelete = table?.rows[this.selectedRowIndex];
                        if (!rowToDelete) {
                            return;
                        }

                        // Store the entire row data for undo
                        const deletedRowCells = rowToDelete.rowCells.map((cell: IdpField) => ({ ...cell }));
                        const deleteRowIndex = this.selectedRowIndex;

                        this.history.do({
                            do: () => {
                                const inputsArray = this.metadataTableInputs.toArray();
                                // Focus logic before deletion
                                const rowFirstCell =
                                    inputsArray.find((input) => input.nativeElement.closest('tr')?.rowIndex === deleteRowIndex + 2) ??
                                    inputsArray.find((input) => input.nativeElement.closest('tr')?.rowIndex === deleteRowIndex);

                                this.verificationService.deleteTableRow(this.currentTableId, deleteRowIndex);

                                if (rowFirstCell) {
                                    rowFirstCell?.nativeElement.focus();
                                } else {
                                    setTimeout(() => {
                                        this.verificationService.selectNextField();
                                    }, 0);
                                }
                            },
                            undo: () => {
                                this.verificationService.insertTableRow(this.currentTableId, deleteRowIndex, deletedRowCells);
                                const rowFirstCell = this.metadataTableInputs
                                    .toArray()
                                    .find((input) => input.nativeElement.closest('tr')?.rowIndex === deleteRowIndex + 1);
                                if (rowFirstCell) {
                                    rowFirstCell.nativeElement.focus();
                                }
                            },
                        });
                    });
                break;
            }
        }
    }

    private selectTable(event: MouseEvent) {
        this.resetGroupSelections();
        this.tableSelected = true;
        setTimeout(() => {
            const tableFirstCell = this.metadataTableInputs.toArray()[0];
            tableFirstCell?.nativeElement.focus();
        }, 0);

        event.preventDefault();
    }

    private selectRow(rowIndex: number, event: MouseEvent) {
        this.resetGroupSelections();
        this.selectedRowIndex = rowIndex;
        setTimeout(() => {
            const rowFirstCell = this.metadataTableInputs.toArray().find((input) => input.nativeElement.closest('tr')?.rowIndex === rowIndex + 1);
            rowFirstCell?.nativeElement.focus();
        }, 0);
        event.preventDefault();
    }

    private selectColumn(columnIndex: number, event: MouseEvent) {
        this.resetGroupSelections();
        this.selectedColumnIndex = columnIndex; // Set the selected column when right-clicking
        setTimeout(() => {
            const columnFirstCell = this.metadataTableInputs
                .toArray()
                .find((input) => input.nativeElement.closest('td')?.cellIndex === columnIndex + 1);
            columnFirstCell?.nativeElement.focus();
        }, 0);
        event.preventDefault();
    }

    resetGroupSelections() {
        this.selectedRowIndex = -1;
        this.selectedColumnIndex = -1;
        this.tableSelected = false;
        this.singleCellFocus = false;
    }
}
