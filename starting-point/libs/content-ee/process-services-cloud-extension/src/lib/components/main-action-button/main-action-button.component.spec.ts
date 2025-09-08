/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContentActionRef, ContentActionType, ExtensionService } from '@alfresco/adf-extensions';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainActionButtonComponent } from './main-action-button.component';
import { MockProvider } from 'ng-mocks';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { of } from 'rxjs';
import { ExtensionActionsHandler } from '../../services/extensions-actions-handler.service';
import { NoopTranslateModule } from '@alfresco/adf-core';

const MOCK_MAIN_ACTION: ContentActionRef = {
    id: 'app.main-action.start.process-cloud',
    title: 'ADF_CLOUD_PROCESS_LIST.ADF_CLOUD_START_PROCESS.FORM.TITLE',
    type: ContentActionType.button,
    actions: {
        click: 'start-process-cloud.actions.new.execute',
    },
    rules: {
        visible: 'app.process-cloud.isProcessServiceCloudRunningAndPluginEnabled',
    },
};

describe('MainActionButtonComponent', () => {
    let loader: HarnessLoader;
    let fixture: ComponentFixture<MainActionButtonComponent>;
    let extensionActionsHandler: ExtensionActionsHandler;
    let extensionService: ExtensionService;

    const initializeComponent = () => {
        fixture = TestBed.createComponent(MainActionButtonComponent);
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [
                MockProvider(ExtensionActionsHandler, {
                    runActionById: () => {},
                }),
                MockProvider(ExtensionService, {
                    setup$: of(undefined),
                    getFeature: () => MOCK_MAIN_ACTION as any,
                }),
            ],
        });

        extensionActionsHandler = TestBed.inject(ExtensionActionsHandler);
        extensionService = TestBed.inject(ExtensionService);
    });

    describe('with main action turned ON', () => {
        beforeEach(() => {
            initializeComponent();
        });

        it('should show action if action is setup in config file', async () => {
            const isButtonPresent = await loader.hasHarness(MatButtonHarness);
            expect(isButtonPresent).toBeTruthy();
        });

        it('should run action on click', async () => {
            const runActionById = spyOn(extensionActionsHandler, 'runActionById');
            const action = await loader.getHarness(MatButtonHarness);

            await action.click();

            expect(runActionById).toHaveBeenCalledWith(MOCK_MAIN_ACTION.actions.click);
        });
    });

    describe('with main action turned OFF', () => {
        beforeEach(() => {
            spyOn(extensionService, 'getFeature').and.returnValue(undefined);
            initializeComponent();
        });

        it('should NOT show action if is NOT set in config file', async () => {
            const isButtonPresent = await loader.hasHarness(MatButtonHarness);
            expect(isButtonPresent).toBeFalsy();
        });
    });
});
