/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ButtonHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { ConfirmationDialogComponent, ConfirmDialogPayload } from './confirmation-dialog.component';

describe('ConfirmationDialog Component', () => {
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    let component: ConfirmationDialogComponent;

    const mockDialog = {
        close: jest.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, MatDialogModule, NoopTranslateModule, ConfirmationDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialog },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        });
    });

    describe('For tests with no injected value for title and subtitle', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(ConfirmationDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('check if there are no custom title/errors added the default values are set', () => {
            expect(component.title).toBeDefined();
            expect(component.title).toEqual('APP.DIALOGS.CONFIRM.TITLE');
            expect(component.messages).toEqual([]);
        });
    });

    describe('For tests with injected value for title and subtitle', () => {
        beforeEach(() => {
            const dialogData: ConfirmDialogPayload = {
                subject: new Subject<boolean>(),
                title: 'Test title',
                subtitle: 'Are you sure?',
                messages: ['error'],
            };
            TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: dialogData });

            fixture = TestBed.createComponent(ConfirmationDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('check if a custom title subtitle, errors are added the right value are set in the confirmation dialog component ', () => {
            expect(component.title).toEqual('Test title');
            expect(component.subtitle).toEqual('Are you sure?');
            expect(component.messages).toEqual(['error']);
        });

        it('subject should next true when confirmed, then complete, and dialog should close', async () => {
            const dialogRef = component.data.subject.toPromise();

            await ButtonHarnessUtils.clickButton({
                fixture,
                buttonFilters: {
                    selector: '[data-automation-id="dialog-confirm"]',
                },
            });

            const value = await dialogRef;

            expect(value).toBe(true);
            expect(mockDialog.close).toHaveBeenCalled();
        });

        it('subject should next false when canceled, then complete and dialog should close', async () => {
            const dialogRef = component.data.subject.toPromise();

            await ButtonHarnessUtils.clickButton({
                fixture,
                buttonFilters: {
                    selector: '[data-automation-id="dialog-close"]',
                },
            });

            const value = await dialogRef;

            expect(value).toBe(false);
            expect(mockDialog.close).toHaveBeenCalled();
        });
    });

    describe('For tests with injected value for buttons', () => {
        beforeEach(() => {
            const dialogData: ConfirmDialogPayload = {
                subject: new Subject<boolean>(),
                confirmButton: {
                    label: 'Custom confirm',
                    theme: 'primary',
                },
                cancelButton: {
                    label: 'Custom cancel',
                },
            };

            TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: dialogData });

            fixture = TestBed.createComponent(ConfirmationDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('buttons should have custom labels', () => {
            expect(component.confirmButton).toEqual({
                label: 'Custom confirm',
                theme: 'primary',
            });
            expect(component.cancelButton).toEqual({
                label: 'Custom cancel',
            });
        });

        it('should render custom label on cancel button', () => {
            const cancelButton = fixture.nativeElement.querySelector('[data-automation-id="dialog-close"]');
            expect(cancelButton).toBeTruthy();
            expect(cancelButton.textContent.trim()).toBe('Custom cancel');
        });

        it('should render custom label on confirm button', () => {
            const confirmButton = fixture.nativeElement.querySelector('[data-automation-id="dialog-confirm"]');
            expect(confirmButton).toBeTruthy();
            expect(confirmButton.textContent.trim()).toBe('Custom confirm');
        });
    });

    describe('For tests with injected value for title and htmlContent', () => {
        beforeEach(() => {
            const dialogData: ConfirmDialogPayload = {
                subject: new Subject<boolean>(),
                title: 'Test title',
                htmlContent: '<div> This is a custom <b>HTML</b> content & needs to be sanitized </div>',
            };

            TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: dialogData });

            fixture = TestBed.createComponent(ConfirmationDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should render the custom html', () => {
            const expectedHtml = '<div> This is a custom <b>HTML</b> content &amp; needs to be sanitized </div>';

            expect(component.htmlContent).toEqual(expectedHtml);

            const customElement = fixture.nativeElement.querySelector('[data-automation-id="confirm-dialog-html-content"]');
            expect(customElement).toBeTruthy();
            expect(customElement.innerHTML).toBe(expectedHtml);
        });
    });

    describe('validation errors', () => {
        beforeEach(() => {
            const mockDialogData: Partial<ConfirmDialogPayload> = {};
            mockDialogData.isValidationErrors = true;
            mockDialogData.messageGroups = [
                { description: 'errorDescription1', key: 'key1', params: { param1: 'value1' } },
                { description: 'errorDescription2', key: 'key2', params: { param2: 'value2' } },
            ];

            TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: mockDialogData });
            fixture = TestBed.createComponent(ConfirmationDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should render validation error translations', () => {
            const validationErrors = fixture.nativeElement.querySelectorAll('li');
            expect(validationErrors.length).toBe(2);
            expect(validationErrors[0].textContent.trim()).toBe('key1');
            expect(validationErrors[1].textContent.trim()).toBe('key2');
        });
    });
});
