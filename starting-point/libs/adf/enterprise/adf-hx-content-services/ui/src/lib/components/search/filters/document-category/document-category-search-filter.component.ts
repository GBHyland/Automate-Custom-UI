/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, ChangeDetectorRef, ViewChild, inject, DestroyRef } from '@angular/core';
import { DocumentModelService, FilterId, SearchFilterValueService } from '@alfresco/adf-hx-content-services/services';
import { finalize } from 'rxjs/operators';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentCategorySearchFilterService } from './document-category-search-filter.service';
import { DocumentCategoryFormType } from './document-category-search-filter.type';
import { SelectionModel } from '@angular/cdk/collections';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { DocumentCategorySearchFilterData } from './document-category-search-filter.data';
import { TranslatePipe } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { SearchFilterInputComponent } from '../../search-filter-input/search-filter-input.component';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchFilterContainerComponent } from '../search-filter-container/search-filter-container.component';
import { BaseSearchFilterDirective } from '../../directives/base-search-filter.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-search-document-category-filter',
    templateUrl: './document-category-search-filter.component.html',
    styleUrls: ['./document-category-search-filter.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatChipsModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        SearchFilterContainerComponent,
        TranslatePipe,
        SearchFilterInputComponent,
    ],
    providers: [DocumentCategorySearchFilterService],
})
export class DocumentCategorySearchFiltersComponent extends BaseSearchFilterDirective<DocumentCategoryFormType> implements OnInit {
    @ViewChild(SearchFilterInputComponent) private searchFilterComponent?: SearchFilterInputComponent;

    protected allowedSysCategories: string[] = ['SysFolder', 'SysFile'];

    protected isLoading = false;

    protected categories: string[] = [];

    protected filteredCategories: string[] = [];

    protected searchTerm = '';

    protected selection = new SelectionModel<string>(true, []);

    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private documentModelService: DocumentModelService,
        protected override searchFilterValueService: SearchFilterValueService,
        protected documentCategorySearchFilterService: DocumentCategorySearchFilterService,
        private changeDetector: ChangeDetectorRef,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) {
        super(searchFilterValueService);

        const icons: Record<string, string> = {
            search_clear: 'assets/search-icons/Clear.svg',
        };

        for (const [iconName, iconPath] of Object.entries(icons)) {
            this.matIconRegistry.addSvgIcon(iconName, this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath));
        }
    }

    public get id(): FilterId {
        return 'DocumentCategorySearchFiltersComponent';
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.documentModelService
            .getModel()
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => (this.isLoading = false))
            )
            .subscribe({
                next: (model) => {
                    this.categories = model
                        .getSubtypes('')
                        .filter((category) => (category.startsWith('Sys') ? this.allowedSysCategories.includes(category) : category));
                    this.filteredCategories = this.categories;
                },
            });
    }

    public toHXQL(data: DocumentCategorySearchFilterData): string {
        return this.documentCategorySearchFilterService.toHXQL(data);
    }

    override clearFilter(): void {
        super.clearFilter();
        this.searchFilterComponent?.clearInput();
        this.selection.clear();
    }

    override applyFilter(): void {
        if (this.selection.selected.length === 0) {
            return this.clearFilter();
        }
        super.applyFilter();
    }

    override overlayClosed(): void {
        this.selection.clear();
        if (this.oldFormValue.selectedCategories.length > 0) {
            for (const category of this.oldFormValue.selectedCategories) {
                this.selection.select(category);
            }
        }

        this.discardPendingChanges();
    }

    protected getFormControls(): { [key: string]: AbstractControl } {
        return {
            selectedCategories: new FormControl([]),
        };
    }

    protected setData(data: DocumentCategorySearchFilterData): void {
        try {
            if (data?.values) {
                for (const category of data?.values || []) {
                    this.selection.select(category.value);
                }
            }
            this.setSelectedValue();
        } catch (error) {
            console.error('Error while setting data for Content Type filter', error);
        }
    }

    protected filteredSearch(searchTerm: string): void {
        this.searchTerm = searchTerm;
        this.filteredCategories = this.categories.filter((entry) => entry.toLowerCase().includes(searchTerm));
    }

    protected onSelectionListChange(event: MatSelectionListChange): void {
        this.onSelectionChange(event?.options[0]?.value);
    }

    protected onDeselect(category: string): void {
        this.onSelectionChange(category);
    }

    protected onSelectionChange(category: string): void {
        this.selection.toggle(category);
        this.setSelectedValue();
    }

    protected setSelectedValue(): void {
        this.filterForm.patchValue({
            selectedCategories: this.selection.selected,
        });

        if (this.selection.selected.length === 0) {
            this.selectedValue = undefined;
            return;
        }

        const selectedValues =
            this.selection.selected.length === 0
                ? undefined
                : this.selection.selected.map((sel) => ({
                      label: sel,
                      value: sel,
                  }));

        this.selectedValue = new DocumentCategorySearchFilterData(selectedValues);
    }

    protected isChecked(category: string): boolean {
        return this.selection.isSelected(category);
    }

    protected clearInput(): void {
        this.searchTerm = '';
        this.filteredCategories = this.categories;
        this.changeDetector.detectChanges();
    }
}
