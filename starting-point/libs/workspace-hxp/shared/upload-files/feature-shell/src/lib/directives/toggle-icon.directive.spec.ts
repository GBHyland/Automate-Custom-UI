/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ViewChild } from '@angular/core';
import { ToggleIconDirective } from './toggle-icon.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
    standalone: true,
    selector: 'hxp-test-component',
    template: ` <button id="testButton" hxpToggleIcon>test</button> `,
    imports: [ToggleIconDirective],
})
class TestComponent {
    @ViewChild(ToggleIconDirective)
    directive: ToggleIconDirective;
}

describe('ToggleIconDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ToggleIconDirective, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should set toggle to true on mouseenter', () => {
        const button: HTMLElement = fixture.nativeElement.querySelector('#testButton');
        button.dispatchEvent(new MouseEvent('mouseenter'));

        expect(component.directive.isToggled).toBe(true);
    });

    it('should set toggle to false on mouseleave if element is not focused', () => {
        const button: HTMLElement = fixture.nativeElement.querySelector('#testButton');
        button.dispatchEvent(new MouseEvent('mouseleave'));

        expect(component.directive.isToggled).toBe(false);
    });

    it('should set toggle and focus to false on mouseleave when element is focused', () => {
        const button: HTMLElement = fixture.nativeElement.querySelector('#testButton');
        button.dispatchEvent(new Event('focus'));
        expect(component.directive.isToggled).toBe(true);

        button.dispatchEvent(new MouseEvent('mouseleave'));

        expect(component.directive.isToggled).toBe(false);
        expect(component.directive.isFocused).toBe(false);
    });

    it('should set toggle and focus to true when element is focused', () => {
        const button: HTMLElement = fixture.nativeElement.querySelector('#testButton');
        button.dispatchEvent(new Event('focus'));

        expect(component.directive.isToggled).toBe(true);
        expect(component.directive.isFocused).toBe(true);
    });

    it('should set toggle and focus to true when element blur event', () => {
        const button: HTMLElement = fixture.nativeElement.querySelector('#testButton');
        button.dispatchEvent(new Event('focus'));
        button.dispatchEvent(new Event('blur'));

        expect(component.directive.isToggled).toBe(false);
        expect(component.directive.isFocused).toBe(false);
    });
});
