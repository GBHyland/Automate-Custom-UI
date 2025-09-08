/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';

@Directive({
    selector: '[allowDecimalValues]',
    standalone: true,
})
export class AllowDecimalValuesDirective {
    private readonly element = inject(ElementRef);

    @Input() allowDecimalValues = false;

    private get regex() {
        return this.allowDecimalValues ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
    }

    @HostListener('input', ['$event'])
    onInput(): void {
        const inputElement = this.element.nativeElement;
        let value = inputElement.value;

        if (!this.regex.test(value)) {
            value = value.replace(/[^0-9-]/g, '');
            if (!this.allowDecimalValues) {
                value = value.replace(/\./g, '');
            }
            inputElement.value = value;
        }
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent): void {
        const clipboardData = event.clipboardData?.getData('text') || '';

        if (!this.regex.test(clipboardData)) {
            event.preventDefault();
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', '-', 'Tab'];
        if (this.allowDecimalValues) {
            allowedKeys.push('.');
        }

        if (allowedKeys.includes(event.key) || (event.key >= '0' && event.key <= '9')) {
            return;
        }

        event.preventDefault();
    }
}
