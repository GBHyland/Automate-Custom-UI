/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Directive, HostListener } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[hxpToggleIcon]',
    exportAs: 'toggleIcon',
})
export class ToggleIconDirective {
    private isFocus = false;
    private toggle = false;

    get isToggled(): boolean {
        return this.toggle;
    }

    get isFocused(): boolean {
        return this.isFocus;
    }

    @HostListener('mouseenter') onMouseEnter() {
        if (!this.isFocus) {
            this.toggle = true;
        }
    }

    @HostListener('mouseleave') onMouseLeave() {
        if (!this.isFocus) {
            this.toggle = false;
        }

        if (this.isFocus && this.toggle) {
            this.isFocus = false;
            this.toggle = false;
        }
    }

    @HostListener('focus') onFocus() {
        this.isFocus = true;
        this.toggle = true;
    }

    @HostListener('blur') onBlur() {
        this.isFocus = false;
        this.toggle = false;
    }
}
