/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Directive, HostListener, Input } from '@angular/core';

@Directive({
    standalone: true,
    selector: 'button[apaPrint]',
})
export class PrintDirective {
    @Input() printSectionSelector: string;

    @Input() printTitle: string;

    @HostListener('click')
    print(): void {
        const baseTag = this.getElementTag('base');
        const styles = this.getElementTag('style');
        const links = this.getElementTag('link');

        const printContents = this.getHtmlContent();

        const printWindow = window.open('', '_blank', 'top=0,left=0,height=auto,width=auto');

        if (!printWindow) {
            return;
        }

        printWindow.document.open();

        const templateString = `
            <html class="apa-print-section">
                <head>
                    <title>${this.printTitle ? this.printTitle : ''}</title>
                    ${baseTag}
                    ${styles}
                    ${links}
                </head>
                <body>
                    ${printContents}
                    <script defer>
                    function triggerPrint(event) {
                        window.removeEventListener('load', triggerPrint, false);
                        closeWindow(window.print());
                    }
                    function closeWindow(){
                        window.close();
                    }
                    window.addEventListener('load', triggerPrint, false);
                    </script>
                </body>
                </html>
            `;

        printWindow.document.write(templateString);
        printWindow.document.close();
    }

    private getElementTag(tag: keyof HTMLElementTagNameMap): string {
        const html: string[] = [];
        const elements = document.getElementsByTagName(tag);

        for (let index = 0; index < elements.length; index++) {
            html.push(elements[index].outerHTML);
        }

        return html.join('\r\n');
    }

    private setDefaultFormData(data: HTMLCollectionOf<HTMLInputElement | HTMLTextAreaElement>): void {
        for (let i = 0; i < data.length; i++) {
            const htmlElement = data[i];
            htmlElement.defaultValue = htmlElement.value;

            if (this.canElementBeChecked(htmlElement)) {
                htmlElement.defaultChecked = !!htmlElement.checked;
            }
        }
    }

    private canElementBeChecked(element: { checked?: boolean } & Element): element is HTMLInputElement {
        return element.checked !== undefined;
    }

    private getHtmlContent(): string {
        const printContents = document.querySelector(this.printSectionSelector);

        if (!printContents) {
            return '';
        }

        const htmlInputs = printContents.getElementsByTagName('input');
        this.setDefaultFormData(htmlInputs);

        const htmlTxt = printContents.getElementsByTagName('textarea');
        this.setDefaultFormData(htmlTxt);

        return printContents.innerHTML;
    }
}
