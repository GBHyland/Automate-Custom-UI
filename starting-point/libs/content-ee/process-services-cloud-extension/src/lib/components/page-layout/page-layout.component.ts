/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ViewEncapsulation, Inject, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService, NavBarMode, PROCESS_SERVICES_CLOUD_LAYOUT_PROVIDER } from '../../services/process-services-cloud-extension-layout.provider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    imports: [CommonModule, TranslatePipe, MatButtonModule, MatIconModule],
    selector: 'app-page-layout',
    templateUrl: './page-layout.component.html',
    styleUrls: ['./page-layout.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'app-page-layout' },
})
export class PageLayoutComponent {
    showNavBarToggleButton = false;
    appNavBarMode$: Observable<NavBarMode>;

    constructor(
        @Optional()
        @Inject(PROCESS_SERVICES_CLOUD_LAYOUT_PROVIDER)
        private readonly layoutService: LayoutService
    ) {
        if (this.layoutService) {
            this.appNavBarMode$ = this.layoutService.appNavNarMode$.pipe(takeUntilDestroyed());
            this.showNavBarToggleButton = true;
        }
    }

    toggleNavBar(): void {
        this.layoutService.toggleAppNavBar$.next();
    }
}
