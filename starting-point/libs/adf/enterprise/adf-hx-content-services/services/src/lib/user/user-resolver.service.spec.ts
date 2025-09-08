/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockService, ngMocks } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { UserResolverService } from './user-resolver.service';
import { UserService } from '../user/user.service';
import { generateMockError, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { User } from '@hylandsoftware/hxcs-js-client';

const mockUserService: UserService = MockService(UserService);
const [user1, user2] = jestMocks.users;

describe('UserResolverService', () => {
    let service: UserResolverService;
    let resolveUserSpy: jest.SpyInstance<Observable<User>>;

    beforeEach(() => {
        ngMocks.autoSpy('jest');

        resolveUserSpy = jest.spyOn(mockUserService, 'resolveUser').mockImplementation((id) => {
            if (id === user1.id) {
                return of(user1);
            }

            if (id === user2.id) {
                return of(user2);
            }
            throw generateMockError('No test id found');
        });

        service = new UserResolverService(mockUserService);
    });

    afterEach(() => {
        resolveUserSpy.mockReset();
    });

    it('should generate full user name', (done) => {
        service.parse([user1.id]).subscribe((name: string) => {
            expect(name).toEqual(`${user1.firstName} ${user1.lastName}`);
            expect(resolveUserSpy).toHaveBeenCalled();

            done();
        });
    });

    it('should resolve multiple users', (done) => {
        service.parse([user1.id, user2.id]).subscribe((name: string) => {
            expect(name).toEqual(`${user1.firstName} ${user1.lastName},${user2.firstName} ${user2.lastName}`);
            expect(resolveUserSpy).toHaveBeenCalledTimes(2);

            done();
        });
    });

    it('should return a resolved user if the user is already resolved', (done) => {
        service.parse([user1]).subscribe((name: string) => {
            expect(name).toEqual(`${user1.firstName} ${user1.lastName}`);
            expect(resolveUserSpy).not.toHaveBeenCalled();

            done();
        });
    });

    it('should handle multiple resolved users', (done) => {
        service.parse([user1, user2]).subscribe((name: string) => {
            expect(name).toEqual(`${user1.firstName} ${user1.lastName},${user2.firstName} ${user2.lastName}`);
            expect(resolveUserSpy).not.toHaveBeenCalled();

            done();
        });
    });

    it('should return empty user name when input is undefined', (done) => {
        service.parse().subscribe((name: string) => {
            expect(name).toEqual('');
            expect(resolveUserSpy).not.toHaveBeenCalled();

            done();
        });
    });
});
