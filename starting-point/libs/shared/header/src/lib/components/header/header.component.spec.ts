/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppConfigService, RedirectAuthService, AppConfigServiceMock, NoopTranslateModule, NoopAuthModule } from '@alfresco/adf-core';
import { AlfrescoApiService, AlfrescoApiServiceMock } from '@alfresco/adf-content-services';
import { HxpHeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { UserAppsService } from '../../services/user-apps-list.service';
import { userAppsMock } from '../../mocks/user-apps.mock';
import { of } from 'rxjs/internal/observable/of';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EMPTY, throwError } from 'rxjs';
import { MenuHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { HeaderMenuComponent } from '../header-menu';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { STUDIO_SHARED } from '@features';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness } from '@angular/material/menu/testing';

describe('HxpHeaderComponent', () => {
    let fixture: ComponentFixture<HxpHeaderComponent>;
    let userAppsService: UserAppsService;
    let appConfig: AppConfigServiceMock;

    const isMenuVisible = (): boolean => {
        const element = fixture.debugElement.query(By.css('.hxp-header-menu-container'));
        if (!element) {
            return false;
        }

        const computedStyle = window.getComputedStyle(element.nativeElement);
        return computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && computedStyle.opacity !== '0';
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NoopTranslateModule,
                NoopAuthModule,
                MatSnackBarModule,
                RouterTestingModule,
                MatDialogModule,
                HeaderMenuComponent,
            ],
            providers: [
                {
                    provide: AlfrescoApiService,
                    useClass: AlfrescoApiServiceMock,
                },
                {
                    provide: RedirectAuthService,
                    useValue: { onLogin: EMPTY, onTokenReceived: of(), init: () => {} },
                },
                {
                    provide: AppConfigService,
                    useClass: AppConfigServiceMock,
                },
                provideMockFeatureFlags({
                    [STUDIO_SHARED.ENABLE_LOCALISATION]: true,
                }),
            ],
        });
    });

    beforeEach(() => {
        appConfig = TestBed.inject(AppConfigService);
        appConfig.config = {
            languages: [
                {
                    key: 'en',
                    label: 'English',
                },
                {
                    key: 'fr',
                    label: 'Français',
                },
                {
                    key: 'de',
                    label: 'Deutsch',
                },
                {
                    key: 'it',
                    label: 'Italiano',
                },
                {
                    key: 'es',
                    label: 'Español',
                },
                {
                    key: 'pl',
                    label: 'Polish',
                },
            ],
        };
        fixture = TestBed.createComponent(HxpHeaderComponent);
        userAppsService = TestBed.inject(UserAppsService);
        spyOn(userAppsService, 'getUserAppsData').and.returnValue(of(userAppsMock));
        fixture.detectChanges();
    });

    describe('Header Elements', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should render app switcher icon', () => {
            const element = fixture.debugElement.query(By.css('[data-automation-id="hxp-header-app-switcher-icon"]')).nativeElement;
            expect(element).not.toBeNull();
        });

        it('should render show more menu button', () => {
            const element = fixture.debugElement.query(By.css('hxp-header-menu')).nativeElement;
            expect(element).not.toBeNull();
        });

        it('should render logo image', () => {
            const element = fixture.debugElement.query(By.css('.hxp-sat-header-logo')).nativeElement;
            expect(element).not.toBeNull();
        });

        it('should render application title', () => {
            const element = fixture.debugElement.query(By.css('.hxp-header-app-title')).nativeElement;
            expect(element).not.toBeNull();
        });
    });

    it('should render the user info component', () => {
        const userInfo = fixture.debugElement.query(By.css('hxp-user-initials')).nativeElement;
        expect(userInfo).not.toBeNull();
    });

    it('should toggle menu', async () => {
        const loader = TestbedHarnessEnvironment.loader(fixture);

        const menuHarness = await loader.getHarness(
            MatMenuHarness.with({
                selector: '[data-automation-id="hxp-header-app-switcher-icon"]',
            })
        );

        expect(await menuHarness.isOpen()).toBe(false);
        expect(isMenuVisible()).toBe(false);

        await menuHarness.open();

        expect(await menuHarness.isOpen()).toBe(true);
        expect(isMenuVisible()).toBe(true);

        expect(menuHarness).not.toBeNull();
        expect(await menuHarness.isOpen()).toBe(true);

        await menuHarness.close();

        expect(await menuHarness.isOpen()).toBe(false);
        expect(isMenuVisible()).toBe(false);
    });

    it('should return user data', (done) => {
        userAppsService.getUserAppsData().subscribe((res) => {
            expect(res).toEqual(userAppsMock);
            expect(res.length).toBe(2);
            done();
        });
    });

    it('should create menu items with correct links and texts', () => {
        const toggleMenuIcon = fixture.debugElement.query(By.css('[data-automation-id="hxp-header-app-switcher-icon"]'));
        let element = fixture.debugElement.query(By.css('.hxp-header-menu-container'));
        expect(element).toBeNull();

        toggleMenuIcon.triggerEventHandler('click');
        fixture.detectChanges();

        element = fixture.debugElement.query(By.css('.hxp-header-menu-container'));
        const headerMenuItems = element.queryAll(By.css('.hxp-header-menu-item'));

        expect(headerMenuItems[0].nativeElement.href).toContain('fake-admin-url');
        expect(headerMenuItems[0].nativeElement.textContent.trim()).toBe('admin app');
        expect(headerMenuItems[1].nativeElement.href).toContain('fake-modeling-url');
        expect(headerMenuItems[1].nativeElement.textContent.trim()).toBe('modeling app');
    });

    it('should handle error', (done) => {
        userAppsService.getUserAppsData = jasmine.createSpy().and.returnValue(throwError('error'));

        userAppsService.getUserAppsData().subscribe({
            next: () => throwError('error'),
            error: (error) => {
                expect(error).toEqual('error');
                done();
            },
        });
    });

    it('should show language menu', async () => {
        await MenuHarnessUtils.openMenu({
            fixture,
            menuFilters: {
                selector: '.hxp-header-menu-button',
            },
        });

        const languageMenu = fixture.debugElement.query(By.css('[data-automation-id="hxp-user-language-menu"]'));
        expect(languageMenu).not.toBeNull();
    });

    it('should show only six languages [English, Français, Deutsch, Italiano, Español, Polish]', async () => {
        const showMoreMenu = await MenuHarnessUtils.getMenu({
            fixture,
            menuFilters: {
                selector: '.hxp-header-menu-button',
            },
        });

        await showMoreMenu.open();

        await MenuHarnessUtils.clickMenuItem({
            fixture,
            menuItemFilters: {
                selector: '[data-automation-id="hxp-user-language-menu"]',
            },
            fromRoot: true,
        });

        const languageMenu = await MenuHarnessUtils.getMenu({
            fixture,
            menuFilters: {
                selector: '[data-automation-id="hxp-user-language-menu"]',
            },
            fromRoot: true,
        });

        const languageItems = await languageMenu.getItems();

        const optionTexts = Promise.all(languageItems.map((languageItem) => languageItem.getText()));

        expect(await optionTexts).toEqual(['English', 'Français', 'Deutsch', 'Italiano', 'Español', 'Polish']);
    });
});
