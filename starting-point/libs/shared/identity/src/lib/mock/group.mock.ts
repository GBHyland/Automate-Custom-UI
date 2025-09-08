/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdentityGroupModel } from '../models/identity-group.model';
import { IdentityGroupFilterInterface } from '../models/identity-group-filter.interface';

export const mockVegetableAubergine: IdentityGroupModel = { id: 'aubergine', name: 'Vegetable Aubergine' };
export const mockMeatChicken: IdentityGroupModel = { id: 'chicken', name: 'Meat Chicken' };

export const mockFoodGroups = [mockVegetableAubergine, mockMeatChicken];

export const mockSearchGroupEmptyFilters: IdentityGroupFilterInterface = {
    roles: [],
    withinApplication: '',
};
