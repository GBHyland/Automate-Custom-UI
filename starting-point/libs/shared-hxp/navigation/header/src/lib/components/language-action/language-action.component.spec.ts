/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageActionComponent } from './language-action.component';
import { STUDIO_SHARED } from '@features';
import { By } from '@angular/platform-browser';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';

describe('LanguageActionComponent', () => {
    let fixture: ComponentFixture<LanguageActionComponent>;

    function getLanguageAction() {
        return fixture.debugElement.query(By.css('.hxp-header-action-language'));
    }

    function initTest(featureFlag: boolean) {
        TestBed.configureTestingModule({
            imports: [LanguageActionComponent, NoopTranslateModule],
            providers: [provideMockFeatureFlags({ [STUDIO_SHARED.ENABLE_LOCALISATION]: featureFlag })],
        });

        fixture = TestBed.createComponent(LanguageActionComponent);
        fixture.detectChanges();
    }

    afterEach(() => {
        fixture.destroy();
    });

    describe(`${STUDIO_SHARED.ENABLE_LOCALISATION} on`, () => {
        beforeEach(() => {
            initTest(true);
        });

        it('should display language action', () => {
            expect(getLanguageAction()).toBeTruthy();
        });
    });

    describe(`${STUDIO_SHARED.ENABLE_LOCALISATION} off`, () => {
        beforeEach(() => {
            initTest(false);
        });
        it('should not display language action', () => {
            expect(getLanguageAction()).toBeFalsy();
        });
    });
});
