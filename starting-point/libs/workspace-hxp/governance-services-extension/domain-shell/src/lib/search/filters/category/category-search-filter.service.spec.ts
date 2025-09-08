/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { CategorySearchFilterService } from './category-search-filter.service';
import { GovernanceConfigurationService } from '../../../config/governance-config.service';
import { MultiSelectListSearchFilterData } from '../base/multi-select-list-filter/multi-select-list-search-filter.data';
import { mockConfigEndpointData } from '../../../mocks/mock-configuration.data';
import { of } from 'rxjs';

describe('CategorySearchFilterService', () => {
    let service: CategorySearchFilterService;
    let configServiceMock: Partial<GovernanceConfigurationService>;

    function flattenCategories(filePlans: any[]): any[] {
        const result: any[] = [];
        function recurse(categories: any[], parentId: string | null, filePlanId: string) {
            if (!categories) return;
            for (const cat of categories) {
                result.push({
                    ...cat,
                    parentId: parentId ?? null,
                    filePlanId,
                    categories: undefined,
                });
                if (cat.categories) {
                    recurse(cat.categories, cat.id, filePlanId);
                }
            }
        }
        for (const fp of filePlans) {
            recurse(fp.categories, null, fp.id);
        }
        return result;
    }

    const mockConfigModel = {
        dataSources: mockConfigEndpointData.map((item) => item.environmentDataSourceDTO),
        filePlans: mockConfigEndpointData[0].filePlans,
        categories: flattenCategories(mockConfigEndpointData[0].filePlans),
    } as any;

    beforeEach(() => {
        configServiceMock = { getConfig: () => of(mockConfigModel) };
        TestBed.configureTestingModule({
            providers: [CategorySearchFilterService, { provide: GovernanceConfigurationService, useValue: configServiceMock }],
        });
        service = TestBed.inject(CategorySearchFilterService);
    });

    it('should return categories from mock configuration data', (done) => {
        service.getCategories().subscribe((cats) => {
            expect(cats).toEqual([
                // eslint-disable-next-line @cspell/spellchecker
                { label: 'File P…/Retent…', value: '4567', tooltip: 'File Plan HR/Retention Category HR APAC' },
                // eslint-disable-next-line @cspell/spellchecker
                { label: 'File P…/.../Retent…', value: '7654', tooltip: 'File Plan HR/Retention Category HR APAC/Retention Category HR EU' },
                // eslint-disable-next-line @cspell/spellchecker
                { label: 'File P…/Sub Re…', value: '7655', tooltip: 'File Plan HR/Sub Retention Category HR EU' },
            ]);
            done();
        });
    });

    it('toQueryParams should map selected items to categoryId array', () => {
        const data = new MultiSelectListSearchFilterData([{ label: 'FP/Cat', value: 'cat1', tooltip: 'FP/Cat' }]);

        expect(service.toQueryParams(data)).toEqual({ categoryId: ['cat1'] });
    });
});
