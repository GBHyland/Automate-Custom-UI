/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponents } from 'ng-mocks';
import { of } from 'rxjs';
import { AppLayoutContainerComponent } from './app-layout-container.component';
import { ApplicationChromeComponent } from '@hxp/shared-hxp/navigation/application-chrome';
import { ShellLayoutComponent } from '@alfresco/adf-core/shell';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { By } from '@angular/platform-browser';

describe('AppLayoutContainerComponent', () => {
    let fixture: ComponentFixture<AppLayoutContainerComponent>;
    let featuresServiceSpy: jasmine.SpyObj<IFeaturesService>;

    beforeEach(async () => {
        featuresServiceSpy = jasmine.createSpyObj('FeaturesService', ['isOn$']);

        await TestBed.configureTestingModule({
            declarations: [AppLayoutContainerComponent, MockComponents(ShellLayoutComponent, ApplicationChromeComponent)],
            providers: [{ provide: FeaturesServiceToken, useValue: featuresServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(AppLayoutContainerComponent);
    });

    it('should display application chrome feature flag is enabled', () => {
        featuresServiceSpy.isOn$.and.returnValue(of(true));
        fixture.detectChanges();

        const applicationChrome = fixture.debugElement.query(By.css('[data-test-id="app-chrome"]'));
        const shell = fixture.debugElement.query(By.css('[data-automation-id="adf-shell"]'));

        expect(applicationChrome).toBeTruthy();
        expect(shell).toBeNull();
    });

    it('should display old shell component when feature flag is off', () => {
        featuresServiceSpy.isOn$.and.returnValue(of(false));
        fixture.detectChanges();

        const applicationChrome = fixture.debugElement.query(By.css('[data-test-id="app-chrome"]'));
        const shell = fixture.debugElement.query(By.css('[data-automation-id="adf-shell"]'));

        expect(applicationChrome).toBeTruthy();
        expect(shell).toBeTruthy();
    });
});
