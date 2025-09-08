/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockService, ngMocks } from 'ng-mocks';
import { ModelApi } from '@hylandsoftware/hxcs-js-client';
import { generateMockResponse, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { DocumentModelService } from './document-model.service';
import { DocumentModel } from './document-model.model';
import { FieldType } from '@alfresco/adf-hx-content-services/api';

const mockModelApi: ModelApi = MockService(ModelApi);

describe('Document Model Service', () => {
    let modelApiSpy: jest.SpyInstance<Promise<any>>;
    let documentModelService: DocumentModelService;

    beforeEach(() => {
        ngMocks.autoSpy('jest');

        modelApiSpy = jest.spyOn(mockModelApi, 'getModel').mockReturnValue(generateMockResponse({ data: jestMocks.modelApi }));

        documentModelService = new DocumentModelService(mockModelApi);
    });

    afterEach(() => {
        modelApiSpy.mockRestore();
    });

    it('should get repository model', (done) => {
        expect(modelApiSpy).toHaveBeenCalledTimes(1);

        documentModelService.getModel().subscribe((model: DocumentModel) => {
            expect(modelApiSpy).toHaveBeenCalledTimes(1);
            expect(model).toBeTruthy();
            done();
        });
    });

    it('should get correct field type from document model', (done) => {
        documentModelService.getModel().subscribe((model: DocumentModel) => {
            expect(model).toBeTruthy();

            expect(model.getFieldType('test_blob')).toEqual(FieldType.Blob);
            expect(model.getFieldType('test_multiblob')).toEqual(FieldType.BlobArray);

            expect(model.getFieldType('test_boolean')).toEqual(FieldType.Boolean);
            expect(model.getFieldType('test_multiboolean')).toEqual(FieldType.BooleanArray);

            expect(model.getFieldType('test_date')).toEqual(FieldType.Date);
            expect(model.getFieldType('test_multidate')).toEqual(FieldType.DateArray);

            expect(model.getFieldType('test_float')).toEqual(FieldType.Float);
            expect(model.getFieldType('test_multifloat')).toEqual(FieldType.FloatArray);

            expect(model.getFieldType('test_int')).toEqual(FieldType.Integer);
            expect(model.getFieldType('test_multiint')).toEqual(FieldType.IntegerArray);

            expect(model.getFieldType('test_string')).toEqual(FieldType.String);
            expect(model.getFieldType('test_multistring')).toEqual(FieldType.StringArray);

            expect(model.getFieldType('test_complex')).toEqual(FieldType.Complex);

            done();
        });
    });

    it('should correctly identify field types as arrays', () => {
        const testModel = new DocumentModel(jestMocks.modelApi);

        expect(testModel.isFieldTypeArray(FieldType.FloatArray)).toBe(true);
        expect(testModel.isFieldTypeArray(FieldType.IntegerArray)).toBe(true);
        expect(testModel.isFieldTypeArray(FieldType.DateArray)).toBe(true);
        expect(testModel.isFieldTypeArray(FieldType.StringArray)).toBe(true);

        expect(testModel.isFieldTypeArray(FieldType.Blob)).toBe(false);
        expect(testModel.isFieldTypeArray(FieldType.Boolean)).toBe(false);
        expect(testModel.isFieldTypeArray(FieldType.Date)).toBe(false);
        expect(testModel.isFieldTypeArray(FieldType.Float)).toBe(false);
        expect(testModel.isFieldTypeArray(FieldType.Integer)).toBe(false);
        expect(testModel.isFieldTypeArray(FieldType.String)).toBe(false);
        expect(testModel.isFieldTypeArray(FieldType.Complex)).toBe(false);
    });

    it('should handle complex field details correctly', () => {
        const docModel = new DocumentModel(jestMocks.modelApi);

        // Inline subfields
        const complexInlineDetails = docModel.getComplexFieldDetails('test_complex');
        expect(complexInlineDetails).toEqual([
            { name: 'field1', type: FieldType.String },
            { name: 'field2', type: FieldType.Date },
        ]);

        // Referenced subfields
        const complexRefDetails = docModel.getComplexFieldDetails('test_complexRef');
        expect(complexRefDetails).toEqual([
            { name: 'refSubField1', type: FieldType.Float },
            { name: 'refSubField2', type: FieldType.Date },
        ]);

        // Non-existent field
        const nonExistentDetails = docModel.getComplexFieldDetails('nonExistentField');
        expect(nonExistentDetails).toEqual([]);
    });

    it('should return true for hasMixin if mixing is present', () => {
        const docModel = new DocumentModel(jestMocks.modelApi);
        expect(docModel.hasMixin('SysFile', 'SysFilish')).toBeTruthy();
    });

    it('should return false for hasMixin if mixing is not present', () => {
        const docModel = new DocumentModel(jestMocks.modelApi);
        expect(docModel.hasMixin('SysFile', 'SysFolderish')).toBeFalsy();
    });

    it('should get Filish categories', () => {
        const docModel = new DocumentModel(jestMocks.modelApi);
        expect(docModel.getFilishTypes()).toEqual(['SysFile', 'SpecialFile', 'SuperSpecialFile']);
    });

    it('should get Folderish categories', () => {
        const docModel = new DocumentModel(jestMocks.modelApi);
        expect(docModel.getFolderishTypes()).toEqual([
            'SuperSpecialFolder',
            'SysFolder',
            'SysOrderedFolder',
            'SysRenditionsContainer',
            'SysVocabulary',
        ]);
    });
});
