/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationChromeComponent } from './application-chrome.component';
import { NoopAuthModule, NoopTranslateModule } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppListService } from '../services/app-list.service';
import { of } from 'rxjs';
import { mockDisplayName, mockGlobalApps, mockSelectedEnv } from '../mocks/components/application-chrome.component.mock';
import { AppEnvService } from '../services/app-env.service';
import { UserInfoService } from '../services/user-info.service';
import { NavigationService } from '../services/navigation.service';
import { By } from '@angular/platform-browser';
import { DisplayModeService, FormCloudDisplayMode } from '@alfresco/adf-process-services-cloud';

describe('ApplicationChromeComponent', () => {
    let fixture: ComponentFixture<ApplicationChromeComponent>;

    afterEach(() => {
        fixture.destroy();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ApplicationChromeComponent, NoopTranslateModule, NoopAuthModule, NoopAnimationsModule],
            providers: [
                {
                    provide: AppListService,
                    useValue: {
                        globalApps$: of(mockGlobalApps),
                    },
                },
                {
                    provide: AppEnvService,
                    useValue: {
                        selectedEnv$: of(mockSelectedEnv),
                    },
                },
                {
                    provide: UserInfoService,
                    useValue: {
                        displayName: mockDisplayName,
                    },
                },
                {
                    provide: NavigationService,
                    useValue: {
                        goTo: jest.fn(),
                    },
                },
                DisplayModeService,
            ],
        });

        fixture = TestBed.createComponent(ApplicationChromeComponent);

        fixture.detectChanges();
    });

    describe(`Feature flag on`, () => {
        beforeEach(() => {
            fixture.componentInstance.featureFlagOn = true;

            fixture.detectChanges();
        });

        it('should display 3 nav items which include home plus 2 apps belonging to the selected env', () => {
            const navItems = fixture.debugElement.queryAll(By.css('sat-platform-nav-list-item'));

            expect(navItems.length).toBe(3);
            expect(navItems[0].query(By.css('.sat-platform-nav-item-label')).nativeElement.textContent.trim()).toBe('APP_CHROME.APP_LIST.HOME');
            expect(navItems[1].query(By.css('.sat-platform-nav-item-label')).nativeElement.textContent.trim()).toBe('mock-app-localized-name-v1');
            expect(navItems[2].query(By.css('.sat-platform-nav-item-label')).nativeElement.textContent.trim()).toBe('mock-app-localized-name-v2');
        });

        it('should display user name', () => {
            const userProfile = fixture.debugElement.query(By.css('sat-platform-nav-user-profile .sat-platform-nav-item-label'));
            expect(userProfile.nativeElement.textContent.trim()).toBe('mock-first-name mock-last-name');
        });

        it('should hide the navbar when fullscreen on form is triggered', () => {
            DisplayModeService.changeDisplayMode({ displayMode: FormCloudDisplayMode.fullScreen, id: 'fake-form-id' });

            fixture.detectChanges();

            const platformNav = fixture.debugElement.query(By.css('sat-platform-nav'));
            expect(platformNav).toBeFalsy();
        });
    });

    describe(`Feature flag off`, () => {
        it('should not display platform nav', () => {
            const platformNav = fixture.debugElement.query(By.css('sat-platform-nav'));
            expect(platformNav).toBeFalsy();
        });
    });
});
