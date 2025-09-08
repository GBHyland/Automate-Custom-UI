/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DestroyRef, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DocumentModel, DocumentModelService } from '@alfresco/adf-hx-content-services/services';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-document-category-picker',
    standalone: true,
    imports: [CommonModule, TranslatePipe, MatOptionModule, MatSelectModule, MatFormFieldModule],
    templateUrl: './document-category-picker.component.html',
    styleUrls: ['./document-category-picker.component.scss'],
})
export class DocumentCategoryPickerComponent implements OnChanges {
    @Input()
    document?: Document;

    @Input()
    required = false;

    @Input()
    value = '';

    @Input()
    filterFn?: (documentCategory: string, documentModel: DocumentModel) => boolean;

    @Input()
    title = 'DOCUMENT_CATEGORY_PICKER.LABEL';

    @Input()
    placeholder = 'DOCUMENT_CATEGORY_PICKER.PLACEHOLDER';

    @Output()
    selectedCategory: EventEmitter<string> = new EventEmitter<string>();

    options: string[] = [];

    private readonly destroyRef = inject(DestroyRef);

    constructor(private documentModelService: DocumentModelService) {}

    ngOnChanges(): void {
        if (!this.document) {
            this.options = [];
            return;
        }

        this.documentModelService
            .getModel()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (model: DocumentModel) => {
                    let types = model.getAllTypes();
                    if (this.filterFn && types?.length > 0) {
                        types = types.filter((type) => this.filterFn && this.filterFn(type, model));
                    }
                    this.options = types;

                    // if the current value is not a valid option, then emit an empty category
                    if (!this.options.includes(this.value)) {
                        this.selectedCategory.emit('');
                    }
                },
            });
    }

    onSelected(e: { value: string | undefined }) {
        this.selectedCategory.emit(e.value);
    }
}
