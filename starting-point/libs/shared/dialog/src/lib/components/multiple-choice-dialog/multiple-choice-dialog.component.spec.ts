/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MultipleChoiceDialogComponent, MultipleChoiceDialogReturnType } from './multiple-choice-dialog.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { Subject } from 'rxjs';
import { DebugElement } from '@angular/core';

describe('MultipleChoiceDialog Component', () => {
    enum fakeType {
        WITH_SAVE = 'WITH_SAVE',
        WITHOUT_SAVE = 'WITHOUT_SAVE',
        ABORT = 'ABORT',
    }
    let fixture: ComponentFixture<MultipleChoiceDialogComponent<fakeType>>;
    let component: MultipleChoiceDialogComponent<fakeType>;
    let element: DebugElement;
    const mockDialogData: any = {};

    const mockDialog = {
        close: jest.fn(),
    };

    function configureTestingModule(customMockDialogData) {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatDialogModule, MultipleChoiceDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialog },
                { provide: MAT_DIALOG_DATA, useValue: customMockDialogData },
            ],
        });
    }

    describe('For tests with injected value for title and subtitle', () => {
        beforeEach(() => {
            mockDialogData.subject = new Subject<MultipleChoiceDialogReturnType<fakeType>>();
            mockDialogData.title = 'Test title';
            mockDialogData.subtitle = 'Do you want to save the changes made to your model?';
            mockDialogData.choices = [
                { title: `Don't Save`, choice: fakeType.WITHOUT_SAVE },
                { title: 'Cancel', choice: fakeType.ABORT },
                { title: 'Save', choice: fakeType.WITH_SAVE },
            ];
            configureTestingModule(mockDialogData);
        });

        beforeEach(() => {
            fixture = TestBed.createComponent<MultipleChoiceDialogComponent<fakeType>>(MultipleChoiceDialogComponent);
            component = fixture.componentInstance;
            element = fixture.debugElement;
            fixture.detectChanges();
        });

        it('should have subtitle and title', () => {
            expect(component.subtitle).toBeDefined();
            expect(component.title).toBeDefined();
        });

        it('should check if a custom title subtitle are added the right value are set in the multiple choice dialog component ', () => {
            expect(component.title).toEqual('Test title');
            expect(component.subtitle).toEqual('Do you want to save the changes made to your model?');
        });

        it(`should check if subject next's WITH_SAVE choice and a dialogRef when Save is clicked and then complete`, (done) => {
            mockDialogData.subject.subscribe({
                next: (value) => {
                    expect(value.choice).toBe('WITH_SAVE');
                    expect(value.dialogRef).toBeTruthy();
                },
                complete: () => {
                    done();
                },
            });

            const saveButton = element.nativeElement.querySelector('[data-automation-id="dialog-button-WITH_SAVE"]');
            saveButton.dispatchEvent(new Event('click'));
        });

        it(`should check if subject next's WITHOUT_SAVE choice and a dialogRef when Don't Save  is clicked and then complete`, (done) => {
            mockDialogData.subject.subscribe({
                next: (value) => {
                    expect(value.choice).toBe('WITHOUT_SAVE');
                    expect(value.dialogRef).toBeTruthy();
                },
                complete: () => {
                    done();
                },
            });

            const dontSaveButton = element.nativeElement.querySelector('[data-automation-id="dialog-button-WITHOUT_SAVE"]');
            dontSaveButton.dispatchEvent(new Event('click'));
        });

        it(`should check if subject next's ABORT choice and a dialogRef when cancel is clicked and then complete`, (done) => {
            mockDialogData.subject.subscribe({
                next: (value) => {
                    expect(value.choice).toBe('ABORT');
                    expect(value.dialogRef).toBeTruthy();
                },
                complete: () => {
                    done();
                },
            });

            const cancelButton = element.nativeElement.querySelector('[data-automation-id="dialog-button-ABORT"]');
            cancelButton.dispatchEvent(new Event('click'));
        });
    });
});
