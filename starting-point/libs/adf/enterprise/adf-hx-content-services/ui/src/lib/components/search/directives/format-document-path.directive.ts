/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Directive, ElementRef, AfterViewInit, Input, SimpleChanges, OnChanges, Renderer2 } from '@angular/core';

@Directive({
    selector: '[hxpFormatDocumentPath]',
    standalone: true,
})
export class FormatDocumentPathDirective implements OnChanges, AfterViewInit {
    @Input('hxpFormatDocumentPath')
    columnWidths!: { [key: string]: number };
    private originalText: string | null = null;

    constructor(private el: ElementRef, private renderer: Renderer2) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['columnWidths']) {
            this.truncatePath();
        }
    }

    ngAfterViewInit() {
        this.originalText = this.el.nativeElement.textContent;
        this.truncatePath();
    }

    private truncatePath() {
        if (!this.originalText) {
            return;
        }

        const element = this.el.nativeElement;
        const parentElement = element.parentNode as HTMLElement;
        this.renderer.setProperty(element, 'innerText', this.originalText);

        const parentWidth = parentElement.offsetWidth;
        const textWidth = element.offsetWidth;
        const parts = this.originalText.split('/');

        if (textWidth > parentWidth && parts.length > 2) {
            this.renderer.setProperty(element, 'innerText', `${parts[0]}/.../${parts[parts.length - 1]}`);
        } else {
            this.renderer.setProperty(element, 'innerText', this.originalText);
        }
    }
}
