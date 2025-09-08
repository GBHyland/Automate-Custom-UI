/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { generateMockError, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { User } from '@hylandsoftware/hxcs-js-client';
import { MockService, ngMocks } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { UserService } from '../user/user.service';
import { UserResolverPipe } from './user-resolver.pipe';

const mockUserService: UserService = MockService(UserService);
const [user1, user2] = jestMocks.users;

@Component({
    selector: 'hxp-test-component',
    template: `<div>{{ users | hxpUserResolverPipe }}</div>`,
    imports: [CommonModule, UserResolverPipe],
    standalone: true,
})
class TestComponent {
    users: string | User | Array<string | User> | undefined;
}

describe('User Resolver Pipe', () => {
    let pipe: UserResolverPipe;
    let resolveUserSpy: jest.SpyInstance<Observable<User>>;
    let fixture: ComponentFixture<TestComponent>;

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

        TestBed.configureTestingModule({
            imports: [TestComponent],
            providers: [UserResolverPipe, { provide: UserService, useValue: mockUserService }, AsyncPipe],
        });
        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        pipe = TestBed.inject(UserResolverPipe);
    });

    afterEach(() => {
        resolveUserSpy.mockReset();
    });

    it('should generate full user name', () => {
        const name = pipe.transform([user1.id]);

        expect(name).toEqual(`${user1.firstName} ${user1.lastName}`);
        expect(resolveUserSpy).toHaveBeenCalled();
    });

    it('should resolve multiple users', () => {
        const name = pipe.transform([user1.id, user2.id]);

        expect(name).toEqual(`${user1.firstName} ${user1.lastName},${user2.firstName} ${user2.lastName}`);
        expect(resolveUserSpy).toHaveBeenCalledTimes(2);
    });

    it('should return a resolved user if the user is already resolved', () => {
        const name = pipe.transform([user1]);

        expect(name).toEqual(`${user1.firstName} ${user1.lastName}`);
        expect(resolveUserSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple resolved users', () => {
        const name = pipe.transform([user1, user2]);

        expect(name).toEqual(`${user1.firstName} ${user1.lastName},${user2.firstName} ${user2.lastName}`);
        expect(resolveUserSpy).not.toHaveBeenCalled();
    });

    it('should return empty user name when input is undefined', () => {
        const name = pipe.transform(undefined);

        expect(name).toEqual('');
        expect(resolveUserSpy).not.toHaveBeenCalled();
    });
});
