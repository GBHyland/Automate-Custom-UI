/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserProfile } from '../../interfaces/user-profile.interface';

export const mockUserWithFullName: UserProfile = {
    id: 'mock-id',
    username: 'mock-username',
    email: 'mock-email',
    firstName: 'mock-first-name',
    lastName: 'mock-last-name',
};

export const mockUserWithUsername: UserProfile = {
    id: 'mock-id',
    username: 'mock-username',
    email: 'mock-email',
};

export const mockUserWithoutFullNameOrUsername: UserProfile = {
    id: 'mock-id',
    email: 'mock-email',
};

export const mockEmptyUser: UserProfile = {
    id: 'mock-id',
    email: 'mock-email',
};

export const mockFullName = 'mock-first-name mock-last-name';

export const mockUsername = 'mock-username';
