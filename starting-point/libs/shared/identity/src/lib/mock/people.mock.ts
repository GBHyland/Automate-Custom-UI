/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdentityUserModel } from '../models/identity-user.model';

export const mockYorkshirePudding: IdentityUserModel = {
    id: 'yorkshire',
    username: 'Yorkshire Pudding',
    firstName: 'Yorkshire',
    lastName: 'Pudding',
    email: 'pudding@food.com',
};
export const mockShepherdsPie: IdentityUserModel = {
    id: 'shepherds',
    username: 'Shepherds Pie',
    firstName: 'Shepherds',
    lastName: 'Pie',
    email: 'shepherds@food.com',
};
export const mockKielbasaSausage: IdentityUserModel = {
    id: 'kielbasa',
    username: 'Kielbasa Sausage',
    firstName: 'Kielbasa',
    lastName: 'Sausage',
    email: 'sausage@food.com',
};
export const mockTestUser: IdentityUserModel = {
    id: '6c1b7fd2-64c0-4413-ba97-c419e2af850b',
    username: 'testuser',
    firstName: 'testuser',
    lastName: 'testuser',
    email: 'hxps-alpha_my_email@hyland.com',
};
export const mockAnotherTestUser: IdentityUserModel = {
    id: '8b4c10de-0a26-49eb-b95c-32416aca46ed',
    username: 'another_testuser',
    firstName: 'another firstName',
    lastName: 'another lastName',
    email: 'another_testuser@hyland.com',
};

export const mockFoodUsers: IdentityUserModel[] = [mockYorkshirePudding, mockShepherdsPie, mockKielbasaSausage];

export const mockPreselectedFoodUsers = [
    { ...mockYorkshirePudding, readonly: false },
    { ...mockKielbasaSausage, readonly: false },
];
