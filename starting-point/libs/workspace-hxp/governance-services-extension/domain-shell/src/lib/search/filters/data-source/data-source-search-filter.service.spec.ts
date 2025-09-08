/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DataSourceSearchFilterService } from './data-source-search-filter.service';
import { GovernanceConfigurationService } from '../../../config/governance-config.service';
import { MultiSelectListSearchFilterData } from '../base/multi-select-list-filter/multi-select-list-search-filter.data';
import { of } from 'rxjs';

describe('DataSourceSearchFilterService', () => {
    let service: DataSourceSearchFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DataSourceSearchFilterService,
                GovernanceConfigurationService,
                {
                    provide: GovernanceConfigurationService,
                    useValue: {
                        getConfig: () => {
                            return of({
                                dataSources: [
                                    {
                                        createdByUser: null,
                                        createdAt: null,
                                        modifiedByUser: null,
                                        modifiedAt: null,
                                        name: 'Production',
                                        description: null,
                                        type: 'Internal Repository',
                                        dataSourceId: 'internal-repo',
                                        repoUrl: 'http://internal-repo.example.com',
                                        id: 'EDS#ds1',
                                    },
                                ],
                            });
                        },
                    },
                },
            ],
        });
        service = TestBed.inject(DataSourceSearchFilterService);
    });

    it('should map config dataSources to filter options', (done) => {
        service.getDataSources().subscribe((dataSources) => {
            expect(dataSources).toEqual([{ label: 'Production', value: 'EDS#ds1', icon: 'internal_repository' }]);
            done();
        });
    });

    it('toQueryParams should map selected items to dataSource array', () => {
        const data: MultiSelectListSearchFilterData = new MultiSelectListSearchFilterData([{ label: 'Production', value: 'EDS#ds1' }]);

        expect(service.toQueryParams(data)).toEqual({ eds: ['EDS#ds1'] });
    });
});
