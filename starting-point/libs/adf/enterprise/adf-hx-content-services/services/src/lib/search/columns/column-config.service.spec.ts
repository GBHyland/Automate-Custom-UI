/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ColumnConfigService } from './column-config.service';
import { StorageService, NoopTranslateModule } from '@alfresco/adf-core';
import { DocumentModelService } from '../../document/document-model/document-model.service';
import { DocumentModel } from '../../document/document-model/document-model.model';
import { of } from 'rxjs';
import { ColumnConfig } from '../models/column-config-data.interface';
import { ColumnDataService } from './column-data.service';
import { FieldType } from '@alfresco/adf-hx-content-services/api';

describe('ColumnConfigService', () => {
    let service: ColumnConfigService;
    let mockStorageService: jest.Mocked<StorageService>;
    let mockDocumentModelService: jest.Mocked<DocumentModelService>;
    let mockColumnDataService: jest.Mocked<ColumnDataService>;

    beforeEach(() => {
        mockStorageService = {
            getItem: jest.fn(),
            setItem: jest.fn(),
        } as unknown as jest.Mocked<StorageService>;

        mockDocumentModelService = {
            getModel: jest.fn(),
        } as unknown as jest.Mocked<DocumentModelService>;

        mockColumnDataService = {
            getCustomSchemaFields: jest.fn(),
        } as unknown as jest.Mocked<ColumnDataService>;

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [
                ColumnConfigService,
                { provide: StorageService, useValue: mockStorageService },
                { provide: DocumentModelService, useValue: mockDocumentModelService },
                { provide: ColumnDataService, useValue: mockColumnDataService },
            ],
        });

        service = TestBed.inject(ColumnConfigService);
    });

    it('should return default columns when no user-specific columns are stored', () => {
        mockStorageService.getItem.mockReturnValue(null);
        const defaultColumns = service.getDefaultColumns();
        const columns = service.getSelectedColumnsForCurrentUser({ email: 'user@example.com' });

        expect(columns).toEqual(defaultColumns);
        expect(mockStorageService.getItem).toHaveBeenCalledWith('user@example.com_selectedColumns');
    });

    it('should return user-specific columns when stored', () => {
        const userColumns: ColumnConfig[] = [{ key: 'icon', title: 'File Icon', sortable: false, removable: true }];
        mockStorageService.getItem.mockReturnValue(JSON.stringify(userColumns));

        const columns = service.getSelectedColumnsForCurrentUser({ email: 'user@example.com' });

        expect(columns).toEqual(userColumns);
        expect(mockStorageService.getItem).toHaveBeenCalledWith('user@example.com_selectedColumns');
    });

    it('should store user-specific columns and updates observable', (done) => {
        const newColumns: ColumnConfig[] = [{ key: 'icon', title: 'File Type', sortable: false, removable: true }];
        mockStorageService.setItem.mockImplementation((key, value) => {
            expect(key).toBe('user@example.com_selectedColumns');
            expect(value).toBe(JSON.stringify(newColumns));
        });

        service.setCurrentSelectedColumnsForCurrentUser({ email: 'user@example.com' }, newColumns);

        service.columnConfigs$.subscribe((cols) => {
            expect(cols).toEqual(newColumns);
            done();
        });
    });

    it('should return custom columns based on DocumentModel', (done) => {
        const customSchemaFields = [
            { name: 'customField1', title: 'Custom Field 1', type: FieldType.String },
            { name: 'customField2', title: 'Custom Field 2', type: FieldType.Date },
        ];

        const mockDocumentModel = {} as DocumentModel;

        mockColumnDataService.getCustomSchemaFields.mockReturnValue(customSchemaFields);
        mockDocumentModelService.getModel.mockReturnValue(of(mockDocumentModel));

        service.getCustomColumns().subscribe((columns) => {
            expect(columns.length).toBe(2);
            expect(columns[0].key).toBe('customField1');
            expect(columns[0].title).toBe('Custom Field 1');
            expect(columns[1].key).toBe('customField2');
            expect(columns[1].title).toBe('Custom Field 2');
            done();
        });
    });
});
