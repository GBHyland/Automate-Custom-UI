/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InfoDialogComponent } from './info-dialog.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { Subject } from 'rxjs';
import { ButtonHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { ErrorLogGroup } from '@alfresco-dbp/shared-core';

describe('InfoDialog Component', () => {
    let fixture: ComponentFixture<InfoDialogComponent>;
    let component: InfoDialogComponent;
    const mockDialogData: Partial<InfoDialogComponent> = {};

    const mockDialog = {
        close: jest.fn(),
    };

    function configureTestingModule(customMockDialogData) {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatDialogModule, InfoDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialog },
                { provide: MAT_DIALOG_DATA, useValue: customMockDialogData },
            ],
        });
    }

    describe('For tests with no injected value for title and subtitle', () => {
        beforeEach(() => {
            mockDialogData.subject = new Subject<boolean>();
            configureTestingModule(mockDialogData);

            fixture = TestBed.createComponent(InfoDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('check if there are no custom title/messages added the default values are set', () => {
            expect(component.title).toBeDefined();
            expect(component.title).toEqual('APP.DIALOGS.CONFIRM.TITLE');
            expect(component.messages).toEqual([]);
        });
    });

    describe('For tests with injected value for title and subtitle', () => {
        beforeEach(() => {
            mockDialogData.subject = new Subject<boolean>();
            mockDialogData.title = 'Test title';
            mockDialogData.subtitle = 'Test subtitle';
            mockDialogData.messages = ['error'];

            configureTestingModule(mockDialogData);

            fixture = TestBed.createComponent(InfoDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should have subtitle, title and errors', () => {
            expect(component.subtitle).toBeDefined();
            expect(component.title).toBeDefined();
            expect(component.messages).toBeDefined();
        });

        it('check if a custom title subtitle, errors are added the right value are set in the confirmation dialog component ', () => {
            expect(component.title).toEqual('Test title');
            expect(component.subtitle).toEqual('Test subtitle');
            expect(component.messages).toEqual(['error']);
        });

        it('dialog should close when clicking close button', async () => {
            jest.spyOn(component.dialog, 'close');
            await ButtonHarnessUtils.clickButton({
                fixture,
                buttonFilters: { text: 'APP.DIALOGS.CLOSE' },
            });
            fixture.detectChanges();

            expect(component.dialog.close).toHaveBeenCalled();
        });
    });

    describe('error translation', () => {
        const messageGroup1: ErrorLogGroup = {
            key: 'error1',
            description: 'error_description1',
            modelName: 'process1',
            modelType: 'process',
        };
        const messageGroup2: ErrorLogGroup = {
            key: 'error2',
            params: { param: 'param_value' },
            description: 'error_description2',
            modelName: 'process1',
            modelType: 'process',
        };
        const messageGroup3: ErrorLogGroup = {
            key: 'error3',
            description: 'error_description3',
            modelName: 'form1',
            modelType: 'form',
        };

        beforeEach(() => {
            mockDialogData.messageGroups = [messageGroup1, messageGroup2, messageGroup3];

            configureTestingModule(mockDialogData);

            fixture = TestBed.createComponent(InfoDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should form message groups data on init', () => {
            expect(component.messageGroupsData['process -- process1'].length).toBe(2);
            expect(component.messageGroupsData['form -- form1'].length).toBe(1);
        });

        it('should store translation keys and params in message groups data', () => {
            expect(component.messageGroupsData['process -- process1'][0].key).toBe('error1');
            expect(component.messageGroupsData['process -- process1'][0].params).toBeFalsy();
            expect(component.messageGroupsData['process -- process1'][1].key).toBe('error2');
            expect(component.messageGroupsData['process -- process1'][1].params).toEqual({ param: 'param_value' });
            expect(component.messageGroupsData['form -- form1'][0].key).toBe('error3');
            expect(component.messageGroupsData['form -- form1'][0].params).toBeFalsy();
        });
    });
});
