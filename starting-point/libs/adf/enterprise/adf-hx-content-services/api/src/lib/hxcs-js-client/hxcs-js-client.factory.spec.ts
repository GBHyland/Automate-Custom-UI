/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { QueryApi } from '@hylandsoftware/hxcs-js-client';
import { getHxcsJsClientProvider } from './hxcs-js-client.factory';
import { mockHxcsJsClientConfigurationService } from '../testing/hxcs-js-client.mock';

describe('getHxcsJsClientProvider', () => {
    let service: QueryApi;

    beforeEach(() => {
        const queryApiProvider = getHxcsJsClientProvider<QueryApi>('QueryApi', QueryApi);

        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [mockHxcsJsClientConfigurationService, queryApiProvider],
        });
        service = TestBed.inject(queryApiProvider.provide);
    });

    it('should provide injectable services', async () => {
        expect(service).toBeInstanceOf(QueryApi);
    });
});
