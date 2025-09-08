/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { SearchFilterValueStoreService } from './search-filter-value-store.service';
import { StorageService } from '@alfresco/adf-core';
import { FilterId } from './models/search-filter-id.type';
import { SearchFilterData } from './models/search-filter.data';
import { BaseSearchFilter } from './models/search-filter.interface';
import { IDENTITY_USER_SERVICE_TOKEN, IIdentityUserService } from '../../identity-user/identity-user.service';

describe('SearchFilterValueStoreService', () => {
    let service: SearchFilterValueStoreService;
    let identityUserServiceMock: jest.Mocked<IIdentityUserService>;
    let storageServiceMock: jest.Mocked<StorageService>;

    const userEmail = 'test@example.com';
    const storageKey = `${userEmail}_hxp-search-filters-value-store`;

    const defaultFilterData = {
        DefaultFilter: {} as SearchFilterData,
    };
    const defaultFilter = { id: 'DefaultFilter' as FilterId } as BaseSearchFilter;

    beforeEach(() => {
        identityUserServiceMock = {
            getCurrentUserInfo: jest.fn().mockReturnValue({ email: userEmail }),
        } as unknown as jest.Mocked<IIdentityUserService>;

        storageServiceMock = {
            getItem: jest.fn().mockImplementation((key) => {
                if (key === storageKey) {
                    return JSON.stringify(defaultFilterData);
                }
                return null;
            }),
            setItem: jest.fn(),
            removeItem: jest.fn(),
        } as unknown as jest.Mocked<StorageService>;

        TestBed.configureTestingModule({
            providers: [
                { provide: IDENTITY_USER_SERVICE_TOKEN, useValue: identityUserServiceMock },
                { provide: StorageService, useValue: storageServiceMock },
            ],
        });

        service = TestBed.inject(SearchFilterValueStoreService);
    });

    it('should load stored filter values', () => {
        expect(service.hasValues()).toBeTruthy();
        expect(service.getValue(defaultFilter)).toEqual(defaultFilterData.DefaultFilter);
    });

    it('should add a filter value and save to storage', () => {
        expect(storageServiceMock.setItem).not.toHaveBeenCalled();

        const filter = { id: 'TestFilter' as FilterId } as BaseSearchFilter;
        const data = {} as SearchFilterData;

        service.addValue(filter, data);

        expect(storageServiceMock.setItem).toHaveBeenCalledWith(storageKey, JSON.stringify({ ...defaultFilterData, TestFilter: data }));
    });

    it('should delete a filter value and save to storage', () => {
        expect(service.hasValues()).toBeTruthy();
        expect(storageServiceMock.setItem).not.toHaveBeenCalled();

        service.deleteValue(defaultFilter);

        expect(storageServiceMock.setItem).toHaveBeenCalledWith(storageKey, JSON.stringify({}));
        expect(service.hasValues()).toBeFalsy();
    });

    it('should clear all stored values and remove item from storage', () => {
        expect(service.hasValues()).toBeTruthy();
        expect(storageServiceMock.removeItem).not.toHaveBeenCalled();

        service.reset();

        expect(storageServiceMock.removeItem).toHaveBeenCalledWith(storageKey);
        expect(service.hasValues()).toBeFalsy();
    });
});
