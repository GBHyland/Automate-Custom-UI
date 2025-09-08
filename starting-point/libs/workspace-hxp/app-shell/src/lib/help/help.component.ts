/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, InjectionToken } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';

const defaultDocumentationUrl = 'https://support.hyland.com/p/hylandexperience';
const HXP_HEADER_MENU_DOCUMENTATION_URL = new InjectionToken<string>(defaultDocumentationUrl, {
    factory: () => defaultDocumentationUrl,
});

@Component({
    standalone: true,
    selector: 'hxp-help',
    template: `
        <a mat-menu-item data-automation-id="help" target="_blank" [href]="docsUrl">
            <mat-icon aria-hidden="true">help_outlined</mat-icon>
            {{ 'APP.HEADER.HELP' | translate }}
        </a>
    `,
    imports: [MatIconModule, MatMenuModule, TranslatePipe],
})
export class HelpComponent {
    docsUrl = inject(HXP_HEADER_MENU_DOCUMENTATION_URL, { optional: true }) ?? defaultDocumentationUrl;
}
