/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ColumnDataService } from './column-data.service';
import { DecimalNumberPipe, FileSizePipe, TimeAgoPipe, TranslationService, NoopTranslateModule } from '@alfresco/adf-core';
import { PropertyUtilService } from '../../document/document-properties/document-properties.util.service';
import { PermissionLevelPipe } from '../../pipes/permission-level.pipe';
import { UserResolverService } from '../../user/user-resolver.service';
import { ColumnKeys } from '../configs/column-keys.enum';
import { DocumentPermissions } from '../../document/configs/document-permissions.enum';
import { DocumentModel } from '../../document/document-model/document-model.model';
import { DatePipe } from '@angular/common';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { of } from 'rxjs';
import { FieldType } from '@alfresco/adf-hx-content-services/api';

describe('ColumnDataService', () => {
    let service: ColumnDataService;
    let mockPropertyUtilService: jest.Mocked<PropertyUtilService>;

    beforeEach(() => {
        mockPropertyUtilService = {
            propertyValue: jest.fn(),
        } as unknown as jest.Mocked<PropertyUtilService>;

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [
                ColumnDataService,
                { provide: PropertyUtilService, useValue: mockPropertyUtilService },
                { provide: PermissionLevelPipe, useValue: { transform: jest.fn() } },
                { provide: FileSizePipe, useValue: { transform: jest.fn() } },
                { provide: TimeAgoPipe, useValue: { transform: jest.fn() } },
                { provide: DatePipe, useValue: { transform: jest.fn() } },
                { provide: DecimalNumberPipe, useValue: { transform: jest.fn() } },
                { provide: UserResolverService, useValue: { parse: jest.fn() } },
            ],
        });
        service = TestBed.inject(ColumnDataService);
    });

    describe('doesColumnValueExist', () => {
        it('should return true when the property exists', () => {
            const document = { ...jestMocks.fileDocument, sys_title: 'Example Title', address: 'Example Address' };
            const exists = service.doesColumnValueExist(document, 'address');
            expect(exists).toBe(true);
        });

        it('should return false when the property does not exist', () => {
            const document = { ...jestMocks.fileDocument, sys_title: 'Example Title' };
            const exists = service.doesColumnValueExist(document, 'address');
            expect(exists).toBe(false);
        });
    });

    describe('getColumnValue', () => {
        let mockFileSizePipe: jest.Mocked<FileSizePipe>;
        let mockPermissionLevelPipe: jest.Mocked<PermissionLevelPipe>;
        let mockTimeAgoPipe: jest.Mocked<TimeAgoPipe>;
        let mockUserResolverPipe: jest.Mocked<UserResolverService>;

        beforeEach(() => {
            mockFileSizePipe = TestBed.inject(FileSizePipe) as jest.Mocked<FileSizePipe>;
            mockPermissionLevelPipe = TestBed.inject(PermissionLevelPipe) as jest.Mocked<PermissionLevelPipe>;
            mockTimeAgoPipe = TestBed.inject(TimeAgoPipe) as jest.Mocked<TimeAgoPipe>;
            mockUserResolverPipe = TestBed.inject(UserResolverService) as jest.Mocked<UserResolverService>;

            const translationService = TestBed.inject(TranslationService);
            jest.spyOn(translationService, 'instant').mockImplementation((key) => key);

            jest.spyOn(mockFileSizePipe, 'transform').mockReturnValue('5 KB');
            jest.spyOn(mockPermissionLevelPipe, 'transform').mockReturnValue({ value: 'PERMISSION_LEVEL.LABEL.READ', class: 'read' });
            jest.spyOn(mockTimeAgoPipe, 'transform').mockReturnValue('1 hour ago');
            jest.spyOn(mockUserResolverPipe, 'parse').mockReturnValue(of('repoadmin repoadmin'));
        });

        it('should handle title property', (done) => {
            const document = { ...jestMocks.fileDocument, sys_title: 'Test Title' };
            service.getColumnValue(document, ColumnKeys.SysTitle).subscribe((value) => {
                expect(value).toEqual('Test Title');
                done();
            });
        });

        it('should handle file size property', (done) => {
            const document = { ...jestMocks.fileDocument, sysfile_blob: { length: 5000 } };
            service.getColumnValue(document, ColumnKeys.SysFileBlobLength).subscribe((value) => {
                expect(value).toEqual('5 KB');
                done();
            });
        });

        it('should handle creation date property', (done) => {
            const document = {
                ...jestMocks.fileDocument,
                sys_created: '2020-01-01T12:00:00Z',
                sys_creator: { email: 'test@example.com', firstName: 'repoadmin', lastName: 'repoadmin' },
            };

            service.getColumnValue(document, ColumnKeys.SysCreated).subscribe((value) => {
                expect(value).toContain('ago');
                expect(value).toContain('DOCUMENT_LIST.COLUMNS.CREATED.BY repoadmin repoadmin');
                done();
            });
        });

        it('should handle valid permissions', (done) => {
            const document = { ...jestMocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.READ] };
            service.getColumnValue(document, ColumnKeys.SysEffectivePermissions).subscribe((value) => {
                expect(value).toBe('PERMISSION_LEVEL.LABEL.READ');
                done();
            });
        });
    });

    describe('getCustomColumnValue', () => {
        let mockDocumentModel: DocumentModel;
        let mockDatePipe: jest.Mocked<DatePipe>;
        let mockDecimalNumberService: jest.Mocked<DecimalNumberPipe>;

        beforeEach(() => {
            mockDocumentModel = new DocumentModel(jestMocks.modelApi);
            mockDatePipe = TestBed.inject(DatePipe) as jest.Mocked<DatePipe>;
            jest.spyOn(mockDatePipe, 'transform').mockImplementation((value): string | null => {
                if (value === '2024-05-07T00:00:00.000Z') {
                    return 'May 7, 2024';
                }
                if (value === '2024-05-08T00:00:00.000Z') {
                    return 'May 8, 2024';
                }
                return null;
            });

            mockDecimalNumberService = TestBed.inject(DecimalNumberPipe) as jest.Mocked<DecimalNumberPipe>;
            jest.spyOn(mockDecimalNumberService, 'transform').mockReturnValue('12,345.67');
        });

        it('should handle different field types correctly', (done) => {
            const document = {
                ...jestMocks.fileDocument,
                dateField: '2024-05-07T00:00:00.000Z',
                numberField: 12345,
                stringField: 'test string',
                booleanField: true,
                dateArrayField: ['2024-05-07T00:00:00.000Z', '2024-05-08T00:00:00.000Z'],
                doubleField: 12345.67,
            };

            jest.spyOn(service, 'doesColumnValueExist').mockReturnValue(true);

            jest.spyOn(mockPropertyUtilService, 'propertyValue').mockReturnValue('2024-05-07T00:00:00.000Z');
            service.getCustomColumnValue(document, 'dateField', mockDocumentModel, FieldType.Date).subscribe((value) => {
                expect(value).toEqual('May 7, 2024');
                done();
            });
        });
    });
});
