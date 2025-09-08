/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { LogoutDirective } from '@alfresco/adf-core';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'hxp-logout',
    standalone: true,
    imports: [MatIconModule, MatMenuModule, TranslatePipe, LogoutDirective],
    template: `
        <button mat-menu-item adf-logout>
            <mat-icon>exit_to_app</mat-icon>
            <span>{{ 'APP.HEADER.SIGN_OUT' | translate }}</span>
        </button>
    `,
})
export class LogoutComponent {}
