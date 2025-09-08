/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { RecordPropertiesButtonComponent } from './record-properties-button.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RecordPropertiesButtonService } from './record-properties-button.service';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { GovernanceRecord, ActionContext } from '../../../mocks/record.type';

describe('RecordPropertiesButtonComponent', () => {
    let component: RecordPropertiesButtonComponent;
    let fixture: any;
    let loader: HarnessLoader;
    let mockService: RecordPropertiesButtonService;

    const mockRecord: GovernanceRecord = {
        id: 'rec-001',
        contentID: '1',
        fileName: 'Test Record',
        status: 'Ready',
        environmentDataSourceId: '',
        cutOffDate: new Date().toISOString(),
        categoryId: '',
        retainUntil: new Date().toISOString(),
    };

    const mockContext: ActionContext = {
        records: [mockRecord],
        showPanel: false,
    };

    beforeEach(() => {
        mockService = {
            isAvailable: jest.fn().mockReturnValue(true),
            execute: jest.fn(),
        } as unknown as RecordPropertiesButtonService;

        TestBed.configureTestingModule({
            imports: [RecordPropertiesButtonComponent, NoopTranslateModule, NoopAnimationsModule],
            providers: [{ provide: RecordPropertiesButtonService, useValue: mockService }],
        });

        fixture = TestBed.createComponent(RecordPropertiesButtonComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should not render the button when isAvailable is false', async () => {
        mockService.isAvailable = jest.fn().mockReturnValue(false);
        component.actionContext = { records: [] };
        fixture.detectChanges();

        const buttons = await loader.getAllHarnesses(MatButtonHarness);
        expect(buttons.length).toBe(0);
    });

    it('should render the button when isAvailable is true', async () => {
        component.actionContext = mockContext;
        fixture.detectChanges();

        const buttons = await loader.getAllHarnesses(MatButtonHarness);
        expect(buttons.length).toBe(1);
    });

    it('should call service.execute with showPanel true when clicked', async () => {
        component.actionContext = mockContext;
        fixture.detectChanges();

        const button = await loader.getHarness(MatButtonHarness);
        await button.click();

        expect(mockService.execute).toHaveBeenCalledWith({
            ...mockContext,
            showPanel: true,
        });
    });
});
