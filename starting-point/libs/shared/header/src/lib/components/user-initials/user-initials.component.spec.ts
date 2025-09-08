/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserInitialsComponent } from './user-initials.component';
import { AuthenticationService, NoopTranslateModule } from '@alfresco/adf-core';
import { IdentityUserModel, IdentityUserService } from '@alfresco-dbp/shared/identity';
import { TooltipHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';

describe('UserInitialsComponent', () => {
    let component: UserInitialsComponent;
    let fixture: ComponentFixture<UserInitialsComponent>;
    let identityUserService: IdentityUserService;
    let authenticationService: AuthenticationService;
    let authenticationServiceSpy: jasmine.Spy;
    let getCurrentUserInfoSpy: jasmine.Spy;

    const identityUserMock = {
        firstName: 'fake-identity-first-name',
        lastName: 'fake-identity-last-name',
        email: 'fakeIdentity@email.com',
        username: 'fake-identity-user',
    } as IdentityUserModel;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [
                {
                    provide: AuthenticationService,
                    useValue: { isOauth: () => true },
                },
                {
                    provide: IdentityUserService,
                    useValue: { getCurrentUserInfo: () => identityUserMock },
                },
            ],
        });
        fixture = TestBed.createComponent(UserInitialsComponent);
        identityUserService = TestBed.inject(IdentityUserService);
        authenticationService = TestBed.inject(AuthenticationService);
        authenticationServiceSpy = spyOn(authenticationService, 'isOauth').and.returnValue(true);
        getCurrentUserInfoSpy = spyOn(identityUserService, 'getCurrentUserInfo').and.returnValue(identityUserMock);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should set the identity user', async () => {
        const user = await component.identityUser$.toPromise();

        expect(user).toEqual(identityUserMock);
    });

    it('should show the user initials', () => {
        expect(authenticationServiceSpy).toHaveBeenCalled();
        expect(getCurrentUserInfoSpy).toHaveBeenCalled();
        expect(fixture.nativeElement.querySelector('[data-automation-id="user-initials-image"]').textContent.trim()).toEqual('ff');
    });

    it('should show the username in tooltip', async () => {
        const tooltipText = await TooltipHarnessUtils.getTooltipText({
            fixture,
            tooltipFilters: {
                selector: '[data-automation-id="hxp-user-initials-tooltip"]',
            },
            fromRoot: true,
        });
        expect(tooltipText).toEqual(identityUserMock.username);
    });
});
