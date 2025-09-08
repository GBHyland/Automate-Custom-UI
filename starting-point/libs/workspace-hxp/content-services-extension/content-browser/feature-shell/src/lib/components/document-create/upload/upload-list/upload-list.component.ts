/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, EventEmitter, Input, OnChanges, Output, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { DataColumnComponent, DataColumnListComponent, DataTableComponent, ObjectDataRow, ToolbarComponent } from '@alfresco/adf-core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { UploadContentModel } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { FileUploadStatus } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { KeyValuePipe, NgClass, NgFor, NgIf, PercentPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

type DocumentCategory = string;

@Component({
    standalone: true,
    selector: 'hxp-workspace-upload-list',
    templateUrl: './upload-list.component.html',
    styleUrls: ['./upload-list.component.scss'],
    host: { class: 'hxp-workspace-upload-list' },
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        PercentPipe,
        KeyValuePipe,
        MatIconModule,
        MatButtonModule,
        TranslatePipe,
        ToolbarComponent,
        MatTooltipModule,
        MatExpansionModule,
        DataTableComponent,
        DataColumnComponent,
        MatProgressBarModule,
        MimeTypeIconComponent,
        DataColumnListComponent,
    ],
})
export class ContentUploadListComponent implements OnChanges {
    @Input()
    data: UploadContentModel[] = [];

    @Output()
    itemsDeleted = new EventEmitter<UploadContentModel[]>();

    @Output()
    itemsSelected = new EventEmitter<UploadContentModel[]>();

    @Output()
    uploadRetry = new EventEmitter<UploadContentModel[]>();

    @ViewChildren(DataTableComponent)
    private uploadRequestTables?: QueryList<DataTableComponent>;

    protected FileUploadStatus = FileUploadStatus;

    protected selectedItems: UploadContentModel[] = [];
    protected contentModelByDocumentCategory: Record<DocumentCategory, UploadContentModel[]> = {};

    private currentSelection = undefined;

    ngOnChanges(): void {
        this.update();
    }

    public update() {
        this.contentModelByDocumentCategory = {};
        this.currentSelection = this.selectedItems;
        // group data by primary type of the document
        for (const item of this.data) {
            const primaryType = item.documentModel?.document?.sys_primaryType;
            if (this.contentModelByDocumentCategory[primaryType]) {
                this.contentModelByDocumentCategory[primaryType].push(item);
            } else {
                this.contentModelByDocumentCategory[primaryType] = [item];
            }
        }
        this.clearSelection();
        // delay the restore selection to wait for rendering to finish
        setTimeout(() => this.restoreSelection(this.currentSelection), 0);
    }

    protected clearSelection() {
        this.selectedItems = undefined;
        if (!this.uploadRequestTables) {
            return;
        }

        this.selectedItems = undefined;
        for (const table of this.uploadRequestTables) {
            table.resetSelection();
            table.onSelectAllClick({
                checked: false,
            } as MatCheckboxChange);
        }
        this.itemsSelected.emit(this.selectedItems);
    }

    protected deleteUpload() {
        const itemsToDelete = this.selectedItems;
        this.itemsDeleted.emit(itemsToDelete);
        this.itemsSelected.emit();
        this.clearSelection();
        this.update();
    }

    protected retryUpload() {
        const uploadsToRetry = this.selectedItems;
        this.uploadRetry.emit(uploadsToRetry);
    }

    protected hasFailedUploads(): boolean {
        return this.data.some(
            (upload) =>
                upload.fileModel.status === FileUploadStatus.Aborted ||
                upload.fileModel.status === FileUploadStatus.Cancelled ||
                upload.fileModel.status === FileUploadStatus.Error
        );
    }

    protected onItemSelect(event: Event, tableId: string) {
        const newSelection = event['detail']?.selection?.length > 0 ? event['detail'].selection.map((selection) => selection.obj) : undefined;
        if (this.selectedItems && newSelection) {
            const table = this.findTableComponent(`table-${tableId}`);
            for (const model of table.rows) {
                const idx = this.selectedItems.indexOf(model);
                if (idx >= 0 && !newSelection.includes(model)) {
                    this.selectedItems.splice(idx, 1);
                }
            }

            this.selectedItems = [...this.selectedItems, ...newSelection.filter((item: UploadContentModel) => !this.selectedItems.includes(item))];
        } else if (!this.selectedItems && newSelection) {
            this.selectedItems = newSelection;
        }

        // emit only if not restoring the selection
        if (!this.currentSelection || this.currentSelection.length === 0) {
            this.itemsSelected.emit(this.selectedItems);
        }
    }

    protected onItemUnselect(event: Event, tableId: string) {
        const currentSelection = event['detail']?.selection?.length > 0 ? event['detail'].selection.map((selection) => selection.obj) : undefined;
        if (this.selectedItems && currentSelection) {
            this.selectedItems = this.selectedItems.filter((selectedItem) => currentSelection.includes(selectedItem));
        } else if (this.selectedItems && (!currentSelection || currentSelection.length === 0)) {
            // unselect all
            const table = this.findTableComponent(`table-${tableId}`);
            for (const model of table.rows) {
                const idx = this.selectedItems.indexOf(model);
                if (idx >= 0) {
                    this.selectedItems.splice(idx, 1);
                }
            }
        }

        // emit only if not restoring the selection
        if (!this.currentSelection || this.currentSelection.length === 0) {
            this.itemsSelected.emit(this.selectedItems);
        }
    }

    private restoreSelection(currentSelection: UploadContentModel[]) {
        if (!this.uploadRequestTables || !currentSelection || currentSelection.length === 0) {
            return;
        }

        let scrollTo;
        for (const item of currentSelection) {
            for (const table of this.uploadRequestTables) {
                const rows = table.data.getRows();
                const idx = rows.findIndex((row: ObjectDataRow) => row.getValue('documentModel') === item.documentModel);
                if (idx >= 0) {
                    table.onCheckboxChange(rows[idx], { checked: true } as MatCheckboxChange);
                    scrollTo = table;
                }
            }
        }
        this.currentSelection = undefined;
        this.itemsSelected.emit(this.selectedItems);

        if (scrollTo) {
            scrollTo.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    private findTableComponent(id: string) {
        return this.uploadRequestTables.find((item) => item['elementRef']?.nativeElement?.getAttribute('id') === id);
    }
}
