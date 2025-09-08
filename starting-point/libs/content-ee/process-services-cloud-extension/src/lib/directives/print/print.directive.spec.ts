/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PrintDirective } from './print.directive';

@Component({
    standalone: true,
    template: `
        <html>
            <head>
                <link href="app.css" />
            </head>
        </html>
        <div class="outerClass">
            <style>
                h1 {
                    color: red;
                }
            </style>

            <div class="printSection">
                <span>Print Section</span>

                <div>
                    <input type="text" value="inputValue" />
                </div>

                <div>
                    <input type="checkbox" name="checkboxName" checked />
                    <label for="checkboxName">checkbox test</label>
                </div>

                <div>
                    <textarea>textareaValue</textarea>
                </div>
            </div>

            <div class="notPrintSection">
                <span>NOT Print Section</span>
            </div>

            <button apaPrint printSectionSelector=".printSection">Print</button>
        </div>
    `,
    imports: [PrintDirective],
})
class PrintTestComponent {}

describe('PrintDirective', () => {
    let openWindow: jasmine.Spy<jasmine.Func>;
    let documentMock: any;
    let fixture: ComponentFixture<PrintTestComponent>;
    let printButton: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PrintTestComponent],
        });

        documentMock = jasmine.createSpyObj({
            open() {},
            write() {},
            close() {},
        });

        openWindow = spyOn(window, 'open').and.returnValue({
            document: documentMock,
        } as any as Window);

        fixture = TestBed.createComponent(PrintTestComponent);
        printButton = fixture.debugElement.query(By.directive(PrintDirective));
        fixture.detectChanges();
    });

    it('should open new window on click', () => {
        printButton.nativeElement.click();
        expect(openWindow).toHaveBeenCalled();
    });

    it('should write printable section', () => {
        printButton.nativeElement.click();

        const calledArgument = documentMock.write.calls.mostRecent().args[0];

        expect(calledArgument).toMatch(/<span .*?>Print Section<\/span>/);
        expect(calledArgument).toMatch(/<input .*? type="checkbox" name="checkboxName" checked="" value="on">/);
        expect(calledArgument).toMatch(/<input .*? type="text" value="inputValue">/);
        expect(calledArgument).toMatch(/<textarea .*?>textareaValue<\/textarea>/);
    });

    it('should not write content outside of the printable section', () => {
        printButton.nativeElement.click();
        const calledArgument = documentMock.write.calls.mostRecent().args[0];

        expect(calledArgument).not.toMatch('NOT Print Section');
    });

    it('should write links', () => {
        printButton.nativeElement.click();

        const calledArgument = documentMock.write.calls.mostRecent().args[0];
        expect(calledArgument).toMatch(/<link .*? href="app.css">/);
    });

    // eslint-disable-next-line ban/ban
    xit('should write styles', () => {
        printButton.nativeElement.click();

        const calledArgument = documentMock.write.calls.mostRecent().args[0];
        expect(calledArgument).toMatch(/<style>h1.*? {color:red;}<\/style>/);
    });
});
