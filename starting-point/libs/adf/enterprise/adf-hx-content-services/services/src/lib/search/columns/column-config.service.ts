/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdentityUserModel, StorageService, TranslationService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ColumnConfig } from '../models/column-config-data.interface';
import { ColumnDataService } from './column-data.service';
import { DocumentModel } from '../../document/document-model/document-model.model';
import { DocumentModelService } from '../../document/document-model/document-model.service';
import { DEFAULT_COLUMNS } from '../configs/default-columns';

@Injectable({
    providedIn: 'root',
})
export class ColumnConfigService {
    public columnConfigs$: Observable<ColumnConfig[]>;
    private columnConfigsSubject = new BehaviorSubject<ColumnConfig[]>(this.getDefaultColumns());

    constructor(
        private storageService: StorageService,
        private documentModeService: DocumentModelService,
        private columnDataService: ColumnDataService,
        protected translationService: TranslationService
    ) {
        this.columnConfigs$ = this.columnConfigsSubject.asObservable();
    }

    getDefaultColumns(): ColumnConfig[] {
        return DEFAULT_COLUMNS;
    }

    getSelectedColumnsForCurrentUser(userInfo: IdentityUserModel): ColumnConfig[] {
        const storedColumns = this.storageService.getItem(`${userInfo.email}_selectedColumns`);
        return storedColumns ? JSON.parse(storedColumns) : this.getDefaultColumns();
    }

    setCurrentSelectedColumnsForCurrentUser(userInfo: IdentityUserModel, columns: ColumnConfig[]): void {
        this.storageService.setItem(`${userInfo.email}_selectedColumns`, JSON.stringify(columns));
        this.columnConfigsSubject.next([...columns]);
    }

    getCustomColumns(): Observable<ColumnConfig[]> {
        return this.documentModeService.getModel().pipe(
            map((model: DocumentModel) => {
                const customColumns: ColumnConfig[] = [];
                const customSchemaFields = this.columnDataService.getCustomSchemaFields(model);
                customSchemaFields.forEach((field) =>
                    customColumns.push({
                        key: field.name,
                        title: field.title.replace(/\w\S*/g, function (txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                        }),
                        sortable: true,
                        removable: true,
                        type: field.type,
                    })
                );
                return customColumns;
            })
        );
    }
}
