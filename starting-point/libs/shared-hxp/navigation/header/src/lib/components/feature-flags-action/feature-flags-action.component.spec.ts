/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureFlagsActionComponent } from './feature-flags-action.component';
import { FlagsOverrideComponent, FlagsOverrideToken } from '@alfresco/adf-core/feature-flags';
import { By } from '@angular/platform-browser';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { MockComponent } from 'ng-mocks';
import { FeaturesDialogService } from '../../services/features-dialog.service';

describe('FeatureFlagsActionComponent', () => {
    let fixture: ComponentFixture<FeatureFlagsActionComponent>;

    const featuresDialogServiceMock = {
        openDialog: jest.fn(),
    };

    function getFeatureFlagsAction() {
        return fixture.debugElement.query(By.css('.hxp-header-action-feature-flags'));
    }

    function initTest(flagsOverride: boolean) {
        TestBed.configureTestingModule({
            imports: [FeatureFlagsActionComponent, NoopTranslateModule, MockComponent(FlagsOverrideComponent)],
            providers: [
                {
                    provide: FlagsOverrideToken,
                    useValue: flagsOverride,
                },
                {
                    provide: FeaturesDialogService,
                    useValue: featuresDialogServiceMock,
                },
            ],
        });

        fixture = TestBed.createComponent(FeatureFlagsActionComponent);
        fixture.detectChanges();
    }

    afterEach(() => {
        fixture.destroy();
    });

    describe('flagsOverride on', () => {
        beforeEach(() => {
            initTest(true);
        });

        it('should display feature flags action', () => {
            expect(getFeatureFlagsAction()).toBeTruthy();
        });

        it('should open dialog when user clicks on action', () => {
            getFeatureFlagsAction().triggerEventHandler('click', null);
            expect(featuresDialogServiceMock.openDialog).toHaveBeenCalled();
        });
    });

    describe('flagsOverride on', () => {
        beforeEach(() => {
            initTest(false);
        });

        it('should not display feature flags action', () => {
            expect(getFeatureFlagsAction()).toBeFalsy();
        });
    });
});
