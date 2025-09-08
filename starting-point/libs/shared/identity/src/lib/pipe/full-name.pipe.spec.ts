/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SharedIdentityFullNamePipe, UserLike } from './full-name.pipe';

describe('SharedIdentityFullNamePipe', () => {
    let pipe: SharedIdentityFullNamePipe;

    let user: UserLike;

    describe('Email address inclusion not requested', () => {
        beforeAll(() => {
            pipe = new SharedIdentityFullNamePipe();
        });

        it('should return empty string when there is no name', () => {
            user = {};

            expect(pipe.transform(user)).toBe('');
        });

        it('should return only firstName as sharedIdentityFullName when there is no lastName', () => {
            user = { firstName: 'Abc' };

            expect(pipe.transform(user)).toBe('Abc');
        });

        it('should return only lastName as sharedIdentityFullName when there is no firstName', () => {
            user = { lastName: 'Xyz' };

            expect(pipe.transform(user)).toBe('Xyz');
        });

        it('should return sharedIdentityFullName when firstName and lastName are available', () => {
            user = { firstName: 'Abc', lastName: 'Xyz' };

            expect(pipe.transform(user)).toBe('Abc Xyz');
        });

        it('should return username when firstName and lastName are not available', () => {
            user = { username: 'username' };

            expect(pipe.transform(user)).toBe('username');
        });

        it('should return user email when firstName, lastName and username are not available', () => {
            user = { email: 'abcXyz@gmail.com' };

            expect(pipe.transform(user)).toBe('abcXyz@gmail.com');
        });
    });

    describe('Email address inclusion requested via injection token', () => {
        beforeEach(() => {
            pipe = new SharedIdentityFullNamePipe(true);
            user = { email: 'abcXyz@gmail.com' };
        });

        it('should return empty string when there is no name', () => {
            user = {};

            expect(pipe.transform(user)).toBe('');
        });

        it('should return only firstName and email address as sharedIdentityFullName when there is no lastName', () => {
            user.firstName = 'Abc';

            expect(pipe.transform(user)).toBe('Abc <abcXyz@gmail.com>');
        });

        it('should return only lastName and email address as sharedIdentityFullName when there is no firstName', () => {
            user.lastName = 'Xyz';

            expect(pipe.transform(user)).toBe('Xyz <abcXyz@gmail.com>');
        });

        it('should return sharedIdentityFullName and email address when firstName and lastName are available', () => {
            user.firstName = 'Abc';
            user.lastName = 'Xyz';

            expect(pipe.transform(user)).toBe('Abc Xyz <abcXyz@gmail.com>');
        });

        it('should return username and email address when firstName and lastName are not available', () => {
            user.username = 'username';

            expect(pipe.transform(user)).toBe('username <abcXyz@gmail.com>');
        });

        it('should return user email when firstName, lastName and username are not available', () => {
            user = { email: 'abcXyz@gmail.com' };

            expect(pipe.transform(user)).toBe('abcXyz@gmail.com');
        });

        it('should not include email address when email address is not available', () => {
            user = { firstName: 'Abc', lastName: 'Xyz' };

            expect(pipe.transform(user)).toBe('Abc Xyz');
        });
    });

    describe('Email address inclusion requested via pipe parameter', () => {
        beforeEach(() => {
            pipe = new SharedIdentityFullNamePipe();
            user = { email: 'abcXyz@gmail.com' };
        });

        it('should return empty string when there is no name', () => {
            user = {};

            expect(pipe.transform(user, true)).toBe('');
        });

        it('should return only firstName and email address as sharedIdentityFullName when there is no lastName', () => {
            user.firstName = 'Abc';

            expect(pipe.transform(user, true)).toBe('Abc <abcXyz@gmail.com>');
        });

        it('should return only lastName and email address as sharedIdentityFullName when there is no firstName', () => {
            user.lastName = 'Xyz';

            expect(pipe.transform(user, true)).toBe('Xyz <abcXyz@gmail.com>');
        });

        it('should return sharedIdentityFullName and email address when firstName and lastName are available', () => {
            user.firstName = 'Abc';
            user.lastName = 'Xyz';

            expect(pipe.transform(user, true)).toBe('Abc Xyz <abcXyz@gmail.com>');
        });

        it('should return username and email address when firstName and lastName are not available', () => {
            user.username = 'username';

            expect(pipe.transform(user, true)).toBe('username <abcXyz@gmail.com>');
        });

        it('should return user email when firstName, lastName and username are not available', () => {
            user = { email: 'abcXyz@gmail.com' };

            expect(pipe.transform(user, true)).toBe('abcXyz@gmail.com');
        });

        it('should not include email address when email address is not available', () => {
            user = { firstName: 'Abc', lastName: 'Xyz' };

            expect(pipe.transform(user, true)).toBe('Abc Xyz');
        });
    });

    describe('Pipe parameter prevalence over token', () => {
        it('should include email when injection token is false and pipe parameter is true', () => {
            user = { firstName: 'Abc', lastName: 'Xyz', email: 'abcXyz@gmail.com' };
            pipe = new SharedIdentityFullNamePipe(false);

            expect(pipe.transform(user, true)).toBe('Abc Xyz <abcXyz@gmail.com>');
        });

        it('should not include email when injection token is true and pipe parameter is false', () => {
            user = { firstName: 'Abc', lastName: 'Xyz' };
            pipe = new SharedIdentityFullNamePipe(true);

            expect(pipe.transform(user, false)).toBe('Abc Xyz');
        });
    });
});
