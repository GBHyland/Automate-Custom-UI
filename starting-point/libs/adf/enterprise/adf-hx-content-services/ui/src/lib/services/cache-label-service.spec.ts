/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { CacheLabelService } from './cache-label-service';
import { NoopTranslateModule, TranslationService } from '@alfresco/adf-core';

describe('CacheLabelService', () => {
    let cacheLabelService: CacheLabelService;
    const mockTranslationService = { instant: jest.fn((key: string) => `${key}_translated`) };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: TranslationService, useValue: mockTranslationService }],
        });

        cacheLabelService = TestBed.inject(CacheLabelService);
    });

    it('should be created', () => {
        expect(cacheLabelService).toBeTruthy();
    });

    describe('getTranslation', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('should return cached value when available', () => {
            const doc = { sys_id: '123', sys_primaryType: 'SysRoot' };
            const translationKey = 'root.translation.key';

            cacheLabelService.getCache().set(doc.sys_id, 'cached value');

            const result = cacheLabelService.getTranslation(doc, translationKey);

            expect(result).toEqual('cached value');
            expect(mockTranslationService.instant).not.toHaveBeenCalled();
        });

        it('should fetch translation and cache it if not cached', () => {
            const doc = { sys_id: '123', sys_primaryType: 'SysRoot' };
            const translationKey = 'root.translation.key';

            const result = cacheLabelService.getTranslation(doc, translationKey);

            expect(result).toEqual(`${translationKey}_translated`);

            expect(cacheLabelService.getCache().has(doc.sys_id)).toBe(true);
            expect(cacheLabelService.getCache().get(doc.sys_id)).toBe(`${translationKey}_translated`);
        });

        it('should generate a unique key and cache value when sys_id is not present', () => {
            const doc = { sys_title: 'Document Title', sys_primaryType: 'not root' };
            const translationKey = 'root.translation.key';

            const expectedKey = 'sys_primaryType=not root|sys_title=Document Title';

            const result = cacheLabelService.getTranslation(doc, translationKey);

            expect(result).toEqual('Document Title');
            expect(cacheLabelService.getCache().has(expectedKey)).toBe(true);
            expect(cacheLabelService.getCache().get(expectedKey)).toBe('Document Title');
            expect(mockTranslationService.instant).not.toHaveBeenCalled();
        });

        it('should return correct label when isRoot is true', () => {
            const doc = { sys_id: '123', sys_primaryType: 'SysRoot' };
            const translationKey = 'root.translation.key';

            const result = cacheLabelService.getTranslation(doc, translationKey);

            expect(result).toBe(`${translationKey}_translated`);
        });

        it('should return sys_title when isRoot is false', () => {
            const doc = { sys_id: '123', sys_title: 'Custom Title', sys_primaryType: 'not root' };
            const translationKey = 'root.translation.key';

            const result = cacheLabelService.getTranslation(doc, translationKey);

            expect(result).toBe('Custom Title');
        });
    });

    describe('generateUniqueKey', () => {
        it('should generate a unique key based on doc properties', () => {
            const doc = { sys_title: 'Document Title', sys_primaryType: 'SysRoot' };
            jest.spyOn(cacheLabelService.getCache(), 'set');

            cacheLabelService.getTranslation(doc, 'root.translation.key');

            const expectedKey = 'sys_primaryType=SysRoot|sys_title=Document Title';
            const expectedTranslation = 'root.translation.key_translated';
            expect(cacheLabelService.getCache().set).toHaveBeenCalledWith(expectedKey, expectedTranslation);
        });

        it('should sort the entries by key', () => {
            const doc = { sys_title: 'Document Title', sys_changeToken: 'sys_changeToken_value', sys_primaryType: 'SysRoot' };
            jest.spyOn(cacheLabelService.getCache(), 'set');

            cacheLabelService.getTranslation(doc, 'root.translation.key');

            const expectedKey = 'sys_changeToken=sys_changeToken_value|sys_primaryType=SysRoot|sys_title=Document Title';
            const expectedTranslation = 'root.translation.key_translated';
            expect(cacheLabelService.getCache().set).toHaveBeenCalledWith(expectedKey, expectedTranslation);
        });
    });
});
