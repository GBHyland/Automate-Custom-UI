/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { AppConfigService, AppConfigServiceMock, JwtHelperService, NoopAuthModule, NoopTranslateModule, OAuth2Service } from '@alfresco/adf-core';
import { IdentityUserService } from './identity-user.service';
import { mockToken } from '../mock/jwt-helper.service.mock';
import {
    mockSearchUserByApp,
    mockSearchUserByAppAndGroups,
    mockSearchUserByGroups,
    mockSearchUserByGroupsAndRoles,
    mockSearchUserByGroupsAndRolesAndApp,
    mockSearchUserByRoles,
    mockSearchUserByRolesAndApp,
    mockSearchUserByRolesAndType,
} from '../mock/identity-user.service.mock';
import { mockFoodUsers } from '../mock/people.mock';
import { of, throwError } from 'rxjs';
import { errorResponse } from '../mock/identity-group.service.mock';
import { UserSearchType } from '../models/user-search-type.enum';

describe('IdentityUserService', () => {
    let service: IdentityUserService;
    let oAuth2Service: OAuth2Service;
    let spyOnGet: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAuthModule],
            providers: [{ provide: AppConfigService, useClass: AppConfigServiceMock }],
        });
        service = TestBed.inject(IdentityUserService);
        oAuth2Service = TestBed.inject(OAuth2Service);
        spyOnGet = spyOn(oAuth2Service, 'get');
    });

    describe('Current user info (JWT token)', () => {
        beforeEach(() => {
            const store: any = {};

            spyOn(localStorage, 'getItem').and.callFake((key: string): string => store[key] || null);
            spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): string => (store[key] = value));
        });

        it('should fetch identity user info from Jwt id token', () => {
            localStorage.setItem(JwtHelperService.USER_ID_TOKEN, mockToken);
            const user = service.getCurrentUserInfo();
            expect(user).toBeDefined();
            expect(user.firstName).toEqual('John');
            expect(user.lastName).toEqual('Doe');
            expect(user.email).toEqual('johnDoe@gmail.com');
            expect(user.username).toEqual('johnDoe1');
        });

        it('should fallback on Jwt access token for identity user info', () => {
            localStorage.setItem(JwtHelperService.USER_ACCESS_TOKEN, mockToken);
            const user = service.getCurrentUserInfo();
            expect(user).toBeDefined();
            expect(user.firstName).toEqual('John');
            expect(user.lastName).toEqual('Doe');
            expect(user.email).toEqual('johnDoe@gmail.com');
            expect(user.username).toEqual('johnDoe1');
        });
    });

    describe('Search', () => {
        it('should fetch users', (done) => {
            spyOnGet.and.returnValue(of(mockFoodUsers));
            const searchSpy = spyOn(service, 'search').and.callThrough();

            service.search('fake').subscribe((res) => {
                expect(res).toBeDefined();
                expect(searchSpy).toHaveBeenCalled();
                expect(service.queryParams).toEqual({
                    search: 'fake',
                });
                done();
            });
        });

        it('should not fetch users if error occurred', (done) => {
            spyOnGet.and.returnValue(throwError(errorResponse));

            const searchSpy = spyOn(service, 'search').and.callThrough();

            service.search('fake').subscribe(
                () => {
                    fail('expected an error, not users');
                },
                (error) => {
                    expect(searchSpy).toHaveBeenCalled();
                    expect(error.status).toEqual(404);
                    expect(error.statusText).toEqual('Not Found');
                    expect(error.error).toEqual('Mock Error');
                    done();
                }
            );
        });

        it('should fetch users by roles', (done) => {
            spyOnGet.and.returnValue(of(mockFoodUsers));
            const searchSpy = spyOn(service, 'search').and.callThrough();

            service.search('fake', mockSearchUserByRoles).subscribe((res) => {
                expect(res).toBeDefined();
                expect(searchSpy).toHaveBeenCalled();
                expect(service.queryParams).toEqual({
                    search: 'fake',
                    role: 'fake-role-1,fake-role-2',
                    type: UserSearchType.INTERACTIVE,
                });
                done();
            });
        });

        it('should not fetch users by roles if error occurred', (done) => {
            spyOnGet.and.returnValue(throwError(errorResponse));

            service.search('fake', mockSearchUserByRoles).subscribe(
                () => {
                    fail('expected an error, not users');
                },
                (error) => {
                    expect(error.status).toEqual(404);
                    expect(error.statusText).toEqual('Not Found');
                    expect(error.error).toEqual('Mock Error');
                    done();
                }
            );
        });

        it('should fetch users by groups', (done) => {
            spyOnGet.and.returnValue(of(mockFoodUsers));
            const searchSpy = spyOn(service, 'search').and.callThrough();

            service.search('fake', mockSearchUserByGroups).subscribe((res) => {
                expect(res).toBeDefined();
                expect(searchSpy).toHaveBeenCalled();
                expect(service.queryParams).toEqual({
                    search: 'fake',
                    group: 'fake-group-1,fake-group-2',
                    type: UserSearchType.INTERACTIVE,
                });
                done();
            });
        });

        it('should fetch users by roles with groups', (done) => {
            spyOnGet.and.returnValue(of(mockFoodUsers));
            const searchSpy = spyOn(service, 'search').and.callThrough();

            service.search('fake', mockSearchUserByGroupsAndRoles).subscribe((res) => {
                expect(res).toBeDefined();
                expect(searchSpy).toHaveBeenCalled();
                expect(service.queryParams).toEqual({
                    search: 'fake',
                    role: 'fake-role-1,fake-role-2',
                    group: 'fake-group-1,fake-group-2',
                    type: UserSearchType.INTERACTIVE,
                });
                done();
            });
        });

        it('should fetch users by type and roles', (done) => {
            spyOnGet.and.returnValue(of(mockFoodUsers));
            const searchSpy = spyOn(service, 'search').and.callThrough();

            service.search('fake', mockSearchUserByRolesAndType).subscribe((res) => {
                expect(res).toBeDefined();
                expect(searchSpy).toHaveBeenCalled();
                expect(service.queryParams).toEqual({
                    search: 'fake',
                    role: 'fake-role-1',
                    type: UserSearchType.ALL,
                });
                done();
            });
        });

        it('should not fetch users by type and roles if error occurred', (done) => {
            spyOnGet.and.returnValue(throwError(errorResponse));

            service.search('fake', mockSearchUserByRolesAndType).subscribe(
                () => {
                    fail('expected an error, not users');
                },
                (error) => {
                    expect(error.status).toEqual(404);
                    expect(error.statusText).toEqual('Not Found');
                    expect(error.error).toEqual('Mock Error');
                    done();
                }
            );
        });

        it('should fetch users by roles with groups and appName', (done) => {
            spyOnGet.and.returnValue(of(mockFoodUsers));
            const searchSpy = spyOn(service, 'search').and.callThrough();

            service.search('fake', mockSearchUserByGroupsAndRolesAndApp).subscribe((res) => {
                expect(res).toBeDefined();
                expect(searchSpy).toHaveBeenCalled();
                expect(service.queryParams).toEqual({
                    search: 'fake',
                    role: 'fake-role-1,fake-role-2',
                    application: 'fake-app-name',
                    group: 'fake-group-1,fake-group-2',
                    type: UserSearchType.INTERACTIVE,
                });
                done();
            });
        });

        it('should not fetch users by groups if error occurred', (done) => {
            spyOnGet.and.returnValue(throwError(errorResponse));

            service.search('fake', mockSearchUserByGroups).subscribe(
                () => {
                    fail('expected an error, not users');
                },
                (error) => {
                    expect(error.status).toEqual(404);
                    expect(error.statusText).toEqual('Not Found');
                    expect(error.error).toEqual('Mock Error');
                    done();
                }
            );
        });

        it('should fetch users within app', (done) => {
            spyOnGet.and.returnValue(of(mockFoodUsers));

            service.search('fake', mockSearchUserByApp).subscribe((res) => {
                expect(res).toBeDefined();
                expect(service.queryParams).toEqual({
                    search: 'fake',
                    application: 'fake-app-name',
                    type: UserSearchType.INTERACTIVE,
                });
                done();
            });
        });

        it('should fetch users within app with roles', (done) => {
            spyOnGet.and.returnValue(of(mockFoodUsers));

            service.search('fake', mockSearchUserByRolesAndApp).subscribe((res) => {
                expect(res).toBeDefined();
                expect(service.queryParams).toEqual({
                    search: 'fake',
                    application: 'fake-app-name',
                    role: 'fake-role-1,fake-role-2',
                    type: UserSearchType.INTERACTIVE,
                });
                done();
            });
        });

        it('should fetch users within app with groups', (done) => {
            spyOnGet.and.returnValue(of(mockFoodUsers));
            const searchSpy = spyOn(service, 'search').and.callThrough();

            service.search('fake', mockSearchUserByAppAndGroups).subscribe((res) => {
                expect(res).toBeDefined();
                expect(searchSpy).toHaveBeenCalled();
                expect(service.queryParams).toEqual({
                    search: 'fake',
                    application: 'fake-app-name',
                    group: 'fake-group-1,fake-group-2',
                    type: UserSearchType.INTERACTIVE,
                });
                done();
            });
        });

        it('should not fetch users within app if error occurred', (done) => {
            spyOnGet.and.returnValue(throwError(errorResponse));

            service.search('fake', mockSearchUserByApp).subscribe(
                () => {
                    fail('expected an error, not users');
                },
                (error) => {
                    expect(error.status).toEqual(404);
                    expect(error.statusText).toEqual('Not Found');
                    expect(error.error).toEqual('Mock Error');
                    done();
                }
            );
        });
    });
});
