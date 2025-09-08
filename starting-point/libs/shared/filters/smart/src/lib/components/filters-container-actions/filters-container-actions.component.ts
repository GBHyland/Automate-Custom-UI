/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { FilterService } from '@alfresco-dbp/shared-filters-services';
import { FilterSaveAsDialogComponent } from '../filter-save-as-dialog/filter-save-as-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { FiltersContainerActions } from '../filters-container/filters-container.component';

@Component({
    selector: 'hxp-filters-container-actions',
    standalone: true,
    imports: [CommonModule, MatButtonModule, TranslatePipe],
    templateUrl: './filters-container-actions.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersContainerActionsComponent implements OnChanges {
    private readonly filterService = inject(FilterService);
    readonly dialog = inject(MatDialog);

    @Input() isDefaultFilter = true;
    @Input() visibleActions: FiltersContainerActions[] = [];

    @Output() saveClick = new EventEmitter<void>();
    @Output() saveAsClick = new EventEmitter<string>();
    @Output() deleteClick = new EventEmitter<void>();

    filtersClean$ = this.filterService.filtersDirty$.pipe(map((filtersDirty) => !filtersDirty));

    private readonly resetAction = {
        label: 'FILTERS.RESET',
        click: () => this.onReset(),
        disabled$: this.filtersClean$,
        visible: true,
    };

    private readonly saveAction = {
        label: 'FILTERS.SAVE',
        click: () => this.onSave(),
        disabled$: this.filtersClean$,
        visible: false,
    };

    private readonly saveAsAction = {
        label: 'FILTERS.SAVE_AS',
        click: () => this.onSaveAs(),
        disabled$: this.filtersClean$,
        visible: true,
    };

    private readonly deleteAction = {
        label: 'FILTERS.DELETE',
        click: () => this.onDelete(),
        disabled$: of(false),
        visible: false,
    };

    readonly actions = [this.resetAction, this.saveAction, this.saveAsAction, this.deleteAction];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isDefaultFilter'] || changes['visibleActions']) {
            this.saveAction.visible = !this.isDefaultFilter && this.visibleActions.includes('save');
            this.deleteAction.visible = !this.isDefaultFilter && this.visibleActions.includes('delete');
            this.saveAsAction.visible = this.visibleActions.includes('saveAs');
            this.resetAction.visible = this.visibleActions.includes('reset');
        }
    }

    onReset(): void {
        this.filterService.resetFilters();
    }

    onSave(): void {
        this.saveClick.emit();
    }

    onSaveAs(): void {
        this.dialog
            .open(FilterSaveAsDialogComponent, {
                height: 'auto',
                minWidth: '500px',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result?.name) {
                    this.saveAsClick.emit(result.name);
                }
            });
    }

    onDelete(): void {
        this.deleteClick.emit();
    }

    trackByActionLabel(index: number, action: any): string {
        return action.label;
    }
}
