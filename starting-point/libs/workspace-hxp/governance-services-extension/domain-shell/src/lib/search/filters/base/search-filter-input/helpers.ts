/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SearchFilterInputComponent } from './search-filter-input.component';
import { ngMocks } from 'ng-mocks';

export const getMockInput = () => ngMocks.find<SearchFilterInputComponent>('hxp-governance-search-filter-input').componentInstance;
