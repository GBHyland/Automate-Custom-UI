/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { PageSizeStorageService } from './page-size-storage.service';
import { StorageService } from '@alfresco/adf-core';
import { PaginationDefault, SavedPaginationKey } from '../config/pagination.config';
import { MockService } from 'ng-mocks';

describe('PageSizeStorageService', () => {
    let service: PageSizeStorageService;
    const mockStorageService: StorageService = MockService(StorageService);
    const spyStorageServiceGet = jest.spyOn(mockStorageService, 'getItem');
    const spyStorageServiceSet = jest.spyOn(mockStorageService, 'setItem');

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PageSizeStorageService, { provide: StorageService, useValue: mockStorageService }],
        });
        service = TestBed.inject(PageSizeStorageService);
    });

    describe('getSize', () => {
        it('should return the saved size from storage', () => {
            spyStorageServiceGet.mockReturnValue('20');

            expect(service.getSize()).toBe(20);
        });

        it('should return the default size if no size is saved in storage', () => {
            spyStorageServiceGet.mockReturnValue(null);

            expect(service.getSize()).toBe(PaginationDefault);
        });

        it('should return the default size if the saved size is not a number', () => {
            spyStorageServiceGet.mockReturnValue('invalid');

            expect(service.getSize()).toBe(PaginationDefault);
        });
    });

    describe('setSize', () => {
        it('should save the size to storage', () => {
            service.setSize(30);
            expect(spyStorageServiceSet).toHaveBeenCalledWith(SavedPaginationKey, '30');
        });
    });
});
