/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmButtonColor } from './confirmation.dialog';

export interface ComponentFixtureTestBed {
    component: ConfirmationDialogComponent;
    fixture: ComponentFixture<ConfirmationDialogComponent>;
}

function setUpComponentWithDialogSettings(dialogData: any): ComponentFixtureTestBed {
    TestBed.configureTestingModule({
        imports: [CommonModule, NoopTranslateModule, MatButtonModule, MatDialogModule],
        providers: [{ provide: MAT_DIALOG_DATA, useValue: dialogData }],
    });
    const fixture = TestBed.createComponent(ConfirmationDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { component, fixture };
}

const testDialogSettingApplied = (dialogData: any, selector: string, assertion: (el: HTMLElement) => void) => {
    const componentFixtureTestBed = setUpComponentWithDialogSettings(dialogData);
    const fixture = componentFixtureTestBed.fixture;
    const element = fixture.debugElement.nativeElement.querySelector(selector);
    expect(element).toBeTruthy();
    assertion(element);
};

describe('ConfirmationDialogComponent', () => {
    it('given the injected settings confirmButtonColor is null, should set the confirm-button color to ' + ConfirmButtonColor.Primary, () => {
        const dialogData = {
            settings: {
                dialogHeader: '',
                confirmLabel: '',
                cancelLabel: '',
                content: '',
            },
        };
        const selector = '[data-automation-id=idp-confirmation-dialog__confirm-button]';
        const assertion = (element: HTMLElement) => {
            expect(element.getAttribute('ng-reflect-color')).toBe(ConfirmButtonColor.Primary);
        };
        testDialogSettingApplied(dialogData, selector, assertion);
    });
    it(
        'given the injected settings confirmButtonColor is ' +
            ConfirmButtonColor.Primary +
            ', should set the confirm-button color to ' +
            ConfirmButtonColor.Primary,
        () => {
            const dialogData = {
                settings: {
                    dialogHeader: '',
                    confirmLabel: '',
                    cancelLabel: '',
                    content: '',
                    confirmButtonColor: ConfirmButtonColor.Primary,
                },
            };
            const selector = '[data-automation-id=idp-confirmation-dialog__confirm-button]';
            const assertion = (element: HTMLElement) => {
                expect(element.getAttribute('ng-reflect-color')).toBe(ConfirmButtonColor.Primary);
            };
            testDialogSettingApplied(dialogData, selector, assertion);
        }
    );
    it(
        'given the injected settings confirmButtonColor is ' +
            ConfirmButtonColor.Warn +
            ', should set the confirm-button color to ' +
            ConfirmButtonColor.Warn,
        () => {
            const dialogData = {
                settings: {
                    dialogHeader: '',
                    confirmLabel: '',
                    cancelLabel: '',
                    content: '',
                    confirmButtonColor: ConfirmButtonColor.Warn,
                },
            };
            const selector = '[data-automation-id=idp-confirmation-dialog__confirm-button]';
            const assertion = (element: HTMLElement) => {
                expect(element.getAttribute('ng-reflect-color')).toBe(ConfirmButtonColor.Warn);
            };
            testDialogSettingApplied(dialogData, selector, assertion);
        }
    );
    it('given the injected settings confirmLabel is "Test", should set the confirm-button label to "Test"', () => {
        const testValue = 'Test';
        const dialogData = {
            settings: {
                dialogHeader: '',
                confirmLabel: testValue,
                cancelLabel: '',
                content: '',
            },
        };
        const selector = '[data-automation-id=idp-confirmation-dialog__confirm-button]';
        const assertion = (element: HTMLElement) => {
            expect(element.textContent).toBe(testValue);
        };
        testDialogSettingApplied(dialogData, selector, assertion);
    });

    it('given the injected settings cancelLabel is "Test", should set the cancel-button label to "Test"', () => {
        const testValue = 'Test';
        const dialogData = {
            settings: {
                dialogHeader: '',
                confirmLabel: '',
                cancelLabel: testValue,
                content: '',
            },
        };
        const selector = '[data-automation-id=idp-confirmation-dialog__cancel-button]';
        const assertion = (element: HTMLElement) => {
            expect(element.textContent).toBe(testValue);
        };
        testDialogSettingApplied(dialogData, selector, assertion);
    });

    it('given the injected settings content is "Test", should set the dialog content to "Test"', () => {
        const testValue = 'Test';
        const dialogData = {
            settings: {
                dialogHeader: '',
                confirmLabel: '',
                cancelLabel: '',
                content: testValue,
            },
        };
        const selector = '[data-automation-id=idp-confirmation-dialog__content]';
        const assertion = (element: HTMLElement) => {
            expect(element.textContent).toBe(testValue);
        };
        testDialogSettingApplied(dialogData, selector, assertion);
    });

    it('given the injected settings dialogHeader is "Test", should set the dialog header to "Test"', () => {
        const testValue = 'Test';
        const dialogData = {
            settings: {
                dialogHeader: testValue,
                confirmLabel: '',
                cancelLabel: '',
                content: '',
            },
        };
        const selector = '[data-automation-id=idp-confirmation-dialog__header]';
        const assertion = (element: HTMLElement) => {
            expect(element.textContent).toBe(testValue);
        };
        testDialogSettingApplied(dialogData, selector, assertion);
    });
});
