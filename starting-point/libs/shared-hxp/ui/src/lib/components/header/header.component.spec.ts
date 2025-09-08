/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HxpWorkspaceHeaderComponent } from './header.component';
import { AppConfigService, AuthenticationService, NoopTranslateModule } from '@alfresco/adf-core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';
import { ExtensionService } from '@alfresco/adf-extensions';
import { IdentityUserService } from '@alfresco-dbp/shared/identity';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';

class MockAppConfigService {
    config: { [key: string]: any } = {
        application: {
            name: 'Test App',
            logo: 'test-logo.png',
            headerImagePath: 'test-image.png',
        },
        landingPage: '/mock-landing-page',
    };

    get(key: string, defaultValue: any) {
        return this.config[key] !== undefined ? this.config[key] : defaultValue;
    }
}

describe('HxpWorkspaceHeaderComponent', () => {
    let fixture: ComponentFixture<HxpWorkspaceHeaderComponent>;
    let headerComponent: HxpWorkspaceHeaderComponent;
    let appConfigService: MockAppConfigService;

    const testAppConfig = {
        application: {
            name: 'Test App',
            logo: 'test-logo.png',
            headerImagePath: 'test-image.png',
        },
    };

    const mockAuthService = {
        isOauth: jasmine.createSpy('isOauth').and.returnValue(true),
        isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true),
    };

    const mockExtensionService = {
        setup$: of(true),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HxpWorkspaceHeaderComponent, NoopTranslateModule, RouterTestingModule],
            providers: [
                { provide: AppConfigService, useClass: MockAppConfigService },
                { provide: AuthenticationService, useValue: mockAuthService },
                { provide: ExtensionService, useValue: mockExtensionService },
                { provide: IdentityUserService, useValue: { getCurrentUserInfo: () => ({}) } },
                provideMockFeatureFlags({
                    'cic-workspace-satori-application-chrome': false,
                }),
            ],
        }).compileComponents();

        appConfigService = TestBed.inject(AppConfigService) as any;
        fixture = TestBed.createComponent(HxpWorkspaceHeaderComponent);
        headerComponent = fixture.componentInstance;
        fixture.detectChanges();
    });

    const setAppConfig = (config: any) => {
        appConfigService.config = { ...appConfigService.config, ...config };
        fixture.detectChanges();
    };

    const subscribeAndAssert = async (observable: any, expectedValue: any) => {
        const value = await observable.pipe(take(1)).toPromise();
        expect(value).toEqual(expectedValue);
    };

    it('should read the landing page from app config json', () => {
        expect(headerComponent.landingPage).toEqual('/mock-landing-page');
    });

    it('should set the header background color from app config', async () => {
        setAppConfig({ headerColor: 'red' });
        await subscribeAndAssert(headerComponent.backgroundColor$, 'red');
    });

    it('should set the header text color from app config', async () => {
        setAppConfig({ headerTextColor: 'blue' });
        await subscribeAndAssert(headerComponent.headerTextColor$, 'blue');
    });

    it('should set the application name from app config', async () => {
        setAppConfig(testAppConfig);
        await subscribeAndAssert(headerComponent.title$, 'Test App');
    });

    it('should set the logo path from app config', async () => {
        setAppConfig(testAppConfig);
        await subscribeAndAssert(headerComponent.logoPath$, 'test-logo.png');
    });

    it('should set the header image path from app config', async () => {
        setAppConfig(testAppConfig);
        await subscribeAndAssert(headerComponent.backgroundImage$, 'test-image.png');
    });

    it('should call toggleMenu on layout when toggleMenu is called', () => {
        const layoutMock = { toggleMenu: jasmine.createSpy('toggleMenu') };
        headerComponent.data = { layout: layoutMock } as any;
        headerComponent.toggleMenu();
        expect(layoutMock.toggleMenu).toHaveBeenCalled();
    });
});
