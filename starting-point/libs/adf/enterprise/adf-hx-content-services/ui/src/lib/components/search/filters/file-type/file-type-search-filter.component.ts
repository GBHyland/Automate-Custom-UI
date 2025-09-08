/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ViewChild } from '@angular/core';
import { FilterId, SearchFilterValueService } from '@alfresco/adf-hx-content-services/services';
import { AbstractControl, FormControl, FormsModule } from '@angular/forms';
import { FileTypeSearchFilterService } from './file-type-search-filter.service';
import { FileTypeSearchFilterFormType } from './file-type-search-filter.type';
import { FileTypeSearchFilterData } from './file-type-search-filter.data';
import { SelectionModel } from '@angular/cdk/collections';
import { FileTypeFlatNode } from './tree/file-type-search-filter-file-type-node';
import { FileTypeSearchFilterTreeComponent } from './tree/file-type-search-filter-tree.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ArrayToStringPipe } from './array-to-string.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchFilterInputComponent } from '../../search-filter-input/search-filter-input.component';
import { SearchFilterContainerComponent } from '../search-filter-container/search-filter-container.component';
import { BaseSearchFilterDirective } from '../../directives/base-search-filter.directive';

@Component({
    selector: 'hxp-file-type-search-filter',
    templateUrl: './file-type-search-filter.component.html',
    styleUrls: ['./file-type-search-filter.component.scss'],
    standalone: true,
    imports: [
        ArrayToStringPipe,
        CommonModule,
        FileTypeSearchFilterTreeComponent,
        FormsModule,
        MatButtonModule,
        MatChipsModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        SearchFilterContainerComponent,
        TranslatePipe,
        SearchFilterInputComponent,
    ],
    providers: [ArrayToStringPipe, FileTypeSearchFilterService],
})
export class FileTypeSearchFilterComponent extends BaseSearchFilterDirective<FileTypeSearchFilterFormType> {
    protected searchTerm = '';
    protected selection = new SelectionModel<FileTypeFlatNode>(
        true,
        [],
        true,
        (fileType1: FileTypeFlatNode, fileType2: FileTypeFlatNode) => fileType1.id === fileType2.id
    );

    @ViewChild(SearchFilterInputComponent) private searchFilterInputComponent!: SearchFilterInputComponent;

    @ViewChild(FileTypeSearchFilterTreeComponent)
    private fileTypeSearchFilterTreeComponent!: FileTypeSearchFilterTreeComponent;

    constructor(
        protected override searchFilterValueService: SearchFilterValueService,
        private fileTypeSearchFilterService: FileTypeSearchFilterService,
        private arrayToStringPipe: ArrayToStringPipe,
        private translateService: TranslateService
    ) {
        super(searchFilterValueService);
    }

    public get id(): FilterId {
        return 'FileTypeSearchFilterComponent';
    }

    public toHXQL(data: FileTypeSearchFilterData): string {
        return this.fileTypeSearchFilterService.toHXQL(data);
    }

    public setData(data: FileTypeSearchFilterData): void {
        try {
            if (data?.values) {
                for (const value of data?.values || []) {
                    if (value.fileTypeId) {
                        this.toggleNodeSelectionFromId(value.fileTypeId);
                    }
                }
            }
            this.setSelectedValue();
        } catch (error) {
            console.error('Error while setting data for File Type Search Filter', error);
        }
    }

    override applyFilter(): void {
        if (this.selection.selected.length === 0) {
            return this.clearFilter();
        }
        super.applyFilter();
    }

    override clearFilter(): void {
        super.clearFilter();
        this.selection.clear();
        this.searchFilterInputComponent.clearInput();
        this.fileTypeSearchFilterTreeComponent.clearSelection();
    }

    override overlayClosed(): void {
        this.selection.clear();
        this.fileTypeSearchFilterTreeComponent.clearSelection();
        this.oldFormValue?.['selectedFileTypes']?.forEach((item: FileTypeFlatNode) => {
            this.fileTypeSearchFilterTreeComponent.fileTypeSelectionToggle(item);
            this.selection.select(item);
        });
        this.discardPendingChanges();
    }

    protected filteredSearch(searchTerm: string): void {
        this.searchTerm = searchTerm;
    }

    protected getFormControls(): { [key: string]: AbstractControl } {
        return {
            selectedFileTypes: new FormControl([]),
        };
    }

    protected onSelectedFileType(selectedFileTypes: FileTypeFlatNode[]): void {
        this.selection.clear();
        for (const selectedFileType of selectedFileTypes) {
            if (selectedFileType?.level !== 0) {
                this.selection.select(selectedFileType);
            }
        }
        this.setSelectedValue();
        this.filterForm.markAsDirty();
    }

    protected toggleSelection(fileTypeNode: FileTypeFlatNode): void {
        this.selection.toggle(fileTypeNode);
        this.fileTypeSearchFilterTreeComponent.fileTypeSelectionToggle(fileTypeNode);
        this.setSelectedValue();
    }

    protected clearSearchInput(): void {
        this.searchTerm = '';
    }

    private toggleNodeSelectionFromId(fileTypeId: string): void {
        this.fileTypeSearchFilterTreeComponent.fileTypeSelectionToggleById(fileTypeId);
    }

    private setSelectedValue(): void {
        this.filterForm.patchValue({
            selectedFileTypes: [...this.selection.selected],
        });

        if (this.selection.selected.length === 0) {
            this.selectedValue = undefined;
            return;
        }

        const selectedValues = this.selection.selected.map((sel) => ({
            label: `${this.translateService.instant(sel.label)} (${this.arrayToStringPipe.transform(sel.extensions || [])})`,
            value: sel.mimeTypes || [],
            fileTypeId: sel.id,
        }));

        this.selectedValue = new FileTypeSearchFilterData(selectedValues);
    }
}
