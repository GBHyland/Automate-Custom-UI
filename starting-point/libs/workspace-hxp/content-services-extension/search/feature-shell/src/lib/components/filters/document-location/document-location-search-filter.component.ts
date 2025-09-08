/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentLocationSearchFilterService } from './document-location-search-filter.service';
import { DocumentLocationSearchFilterFormType } from './document-location-search-filter.type';
import { SelectionModel } from '@angular/cdk/collections';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { finalize } from 'rxjs/operators';
import { DocumentLocationSearchFilterData } from './document-location-search-filter.data';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { HxpWorkspaceDocumentTreeComponent } from '@hxp/workspace-hxp/shared/workspace-document-tree';
import { MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FilterId, SearchFilterValueService } from '@alfresco/adf-hx-content-services/services';
import { BaseSearchFilterDirective, SearchFilterContainerComponent, SearchFilterInputComponent } from '@alfresco/adf-hx-content-services/ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

enum ActiveViewType {
    SearchResults,
    Browse,
}

@Component({
    selector: 'hxp-document-location-search-filter',
    templateUrl: './document-location-search-filter.component.html',
    styleUrls: ['./document-location-search-filter.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatDividerModule,
        MatChipsModule,
        MatInputModule,
        MatListModule,
        MatProgressSpinnerModule,
        MimeTypeIconComponent,
        ReactiveFormsModule,
        SearchFilterContainerComponent,
        TranslatePipe,
        HxpWorkspaceDocumentTreeComponent,
        SearchFilterInputComponent,
    ],
    providers: [DocumentLocationSearchFilterService],
})
export class DocumentLocationSearchFilterComponent extends BaseSearchFilterDirective<DocumentLocationSearchFilterFormType> {
    @ViewChild(SearchFilterInputComponent) private searchFilterComponent!: SearchFilterInputComponent;

    protected ActiveViewType = ActiveViewType;
    protected activeView: ActiveViewType = ActiveViewType.Browse;
    protected filteredDocuments: Document[] = [];
    protected isLoading = false;
    protected selection = new SelectionModel<Document>(true, [], true, (document1, document2) => document1.sys_id === document2.sys_id);

    private readonly destroyRef = inject(DestroyRef);

    constructor(
        protected override searchFilterValueService: SearchFilterValueService,
        private documentLocationSearchFilterService: DocumentLocationSearchFilterService
    ) {
        super(searchFilterValueService);
    }

    public get id(): FilterId {
        return 'DocumentLocationSearchFilterComponent';
    }

    override applyFilter(): void {
        this.goToBrowseView();
        this.resetSearchView();
        if (this.selection.selected.length === 0) {
            return this.clearFilter();
        }
        super.applyFilter();
    }

    override clearFilter(): void {
        super.clearFilter();
        this.selection.clear();
        this.goToBrowseView();
        this.resetSearchView();
    }

    override overlayClosed(): void {
        this.goToBrowseView();
        this.resetSearchView();
        this.selection.clear();
        if (this.oldFormValue.selectedDocuments.length > 0) {
            for (const document of this.oldFormValue.selectedDocuments) {
                this.selection.select(document);
            }
        }
        this.discardPendingChanges();
    }

    public toHXQL(data: DocumentLocationSearchFilterData): string {
        return this.documentLocationSearchFilterService.toHXQL(data);
    }

    onDocumentSelected(document: Document): void {
        this.selection.toggle(document);
        this.setSelectedValue();
        this.filterForm.markAsDirty();
    }

    protected getFormControls(): { [key: string]: AbstractControl } {
        return {
            selectedDocuments: new FormControl([]),
        };
    }

    protected setData(data: DocumentLocationSearchFilterData): void {
        try {
            if (data?.values) {
                for (const value of data?.values || []) {
                    const document = {
                        sys_id: value.docId,
                        sys_name: value.label,
                        sys_path: value.value,
                    } as Document;
                    this.toggleSelection(document);
                }
            }
        } catch (error) {
            console.error('Error while setting data for Document Location filter', error);
        }
    }

    protected filteredSearch(searchTerm: string): void {
        if (searchTerm === '') {
            return;
        }

        this.goToSearchView();

        this.isLoading = true;
        this.documentLocationSearchFilterService
            .searchDocuments(searchTerm)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => (this.isLoading = false))
            )
            .subscribe({
                next: (documents) => {
                    this.filteredDocuments = documents || [];
                },
                error: (error) => {
                    this.filteredDocuments = [];
                    console.error(error);
                },
            });
    }

    protected toggleSelection(document: Document): void {
        this.selection.toggle(document);
        this.setSelectedValue();
    }

    protected handleSelectionChange(event: MatSelectionListChange): void {
        if (event?.options?.length > 0) {
            const document = event?.options[0].value;
            this.toggleSelection(document);
        }
    }

    protected setSelectedValue(): void {
        this.filterForm.patchValue({
            selectedDocuments: [...this.selection.selected],
        });

        if (this.selection.selected.length === 0) {
            this.selectedValue = null;
            return;
        }

        const selectedValues = this.selection.selected.map((sel) => ({
            label: sel.sys_name || '',
            value: sel.sys_path || '',
            docId: sel.sys_id || '',
        }));

        this.selectedValue = new DocumentLocationSearchFilterData(selectedValues);
    }

    protected goToBrowseView(): void {
        this.activeView = ActiveViewType.Browse;
        this.resetSearchView();
    }

    protected goToSearchView(): void {
        this.activeView = ActiveViewType.SearchResults;
    }

    protected resetSearchView(): void {
        this.searchFilterComponent.clearInput();
        this.filteredDocuments = [];
    }
}
