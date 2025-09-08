/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';

@Directive({
    selector: '[hylandIdpStickyBottom]',
    standalone: true,
})
export class StickyBottomDirective implements AfterViewInit {
    @Input() stickToElement?: HTMLElement;

    private readonly stickyElement: HTMLElement;

    constructor(elementRef: ElementRef<HTMLElement>) {
        this.stickyElement = elementRef.nativeElement;
    }

    ngAfterViewInit() {
        const content = this.stickyElement.parentElement?.parentElement?.parentElement;
        content?.addEventListener('scroll', this.checkToolbarPosition.bind(this));
        document.addEventListener('DOMContentLoaded', this.checkToolbarPosition.bind(this));
    }

    private checkToolbarPosition() {
        const viewportHeight = window.innerHeight;
        if (!this.stickyElement || !this.stickToElement) {
            return;
        }

        if (this.stickToElement.getBoundingClientRect().bottom >= viewportHeight - this.stickyElement.offsetHeight - 20) {
            this.stickyElement.classList.remove('relative');
            this.stickyElement.classList.add('fixed');
            this.stickyElement.style.width = `${this.stickyElement.parentElement?.offsetWidth}px`;
        } else {
            this.stickyElement.classList.remove('fixed');
            this.stickyElement.classList.add('relative');
            this.stickyElement.style.width = `${this.stickyElement.parentElement?.offsetWidth}px`;
        }
    }
}
