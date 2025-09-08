/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserInfoComponent } from './user-info.component';
import { AuthenticationService, NoopTranslateModule } from '@alfresco/adf-core';
import { IdentityUserService } from '@alfresco-dbp/shared/identity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UserInfoComponent', () => {
    let component: UserInfoComponent;
    let fixture: ComponentFixture<UserInfoComponent>;

    const mockIdentityUserService = {
        getCurrentUserInfo: jasmine.createSpy('getCurrentUserInfo').and.returnValue({ name: 'Test User' }),
    };

    const mockAuthService = {
        isOauth: jasmine.createSpy('isOauth').and.returnValue(true),
        isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, UserInfoComponent],
            providers: [
                {
                    provide: IdentityUserService,
                    useValue: mockIdentityUserService,
                },
                { provide: AuthenticationService, useValue: mockAuthService },
            ],
        });

        fixture = TestBed.createComponent(UserInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should load identity user info', () => {
        component.getUserInfo();
        expect(mockIdentityUserService.getCurrentUserInfo).toHaveBeenCalled();
        expect(component.identityUser).toBeDefined();
    });

    it('should return true for isLoggedIn', () => {
        expect(component.isLoggedIn).toBeTrue();
    });
});
