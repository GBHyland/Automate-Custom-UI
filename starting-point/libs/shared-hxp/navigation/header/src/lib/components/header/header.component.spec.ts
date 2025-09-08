/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { By } from '@angular/platform-browser';
import { FeatureFlagsActionComponent } from '../feature-flags-action/feature-flags-action.component';
import { LanguageActionComponent } from '../language-action/language-action.component';
import { HelpActionComponent } from '../help-action/help-action.component';
import { MockComponent } from 'ng-mocks';
import { HEADER_CONFIG_TOKEN } from '../../tokens/header-config.token';
import { mockHeaderConfig, mockLogoPath } from '../../mocks/header.component.mock';
import { ActivatedRoute } from '@angular/router';

describe('HeaderComponent', () => {
    let fixture: ComponentFixture<HeaderComponent>;

    afterEach(() => {
        fixture.destroy();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HeaderComponent,
                NoopTranslateModule,
                MockComponent(FeatureFlagsActionComponent),
                MockComponent(LanguageActionComponent),
                MockComponent(HelpActionComponent),
            ],
            providers: [
                {
                    provide: HEADER_CONFIG_TOKEN,
                    useValue: mockHeaderConfig,
                },
                {
                    provide: ActivatedRoute,
                    useValue: {},
                },
            ],
        });

        fixture = TestBed.createComponent(HeaderComponent);

        fixture.detectChanges();
    });

    it('should display header title', () => {
        const title = fixture.debugElement.query(By.css('.hxp-header-app-title'));
        expect(title).toBeTruthy();
    });

    describe('without logoPath input', () => {
        it('should display word mark logo', () => {
            const logo = fixture.debugElement.query(By.css('sat-word-mark-logo'));
            expect(logo).toBeTruthy();
        });

        it('should not display custom logo', () => {
            const logo = fixture.debugElement.query(By.css('img.hxp-header-custom-logo'));
            expect(logo).toBeFalsy();
        });
    });

    describe('with logoPath input', () => {
        beforeEach(() => {
            fixture.componentInstance.logoPath = mockLogoPath;

            fixture.detectChanges();
        });

        it('should display custom logo with src provided by logoPath input', () => {
            const logo = fixture.debugElement.query(By.css('img.hxp-header-custom-logo'));

            expect(logo).toBeTruthy();
            expect(logo.attributes['src']).toBe(mockLogoPath);
        });

        it('should not display word mark logo', () => {
            const logo = fixture.debugElement.query(By.css('sat-word-mark-logo'));
            expect(logo).toBeFalsy();
        });
    });
});
