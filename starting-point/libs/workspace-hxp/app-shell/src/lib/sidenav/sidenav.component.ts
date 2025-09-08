/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DestroyRef, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DynamicExtensionComponent, ExtensionConfig, ExtensionService, NavBarGroupRef } from '@alfresco/adf-extensions';
import { Observable } from 'rxjs';
import { SidenavExtensionService } from '../extensions/sidenav.extension.service';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    selector: 'hxp-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'app-sidenav' },
    imports: [AsyncPipe, MatListModule, DynamicExtensionComponent],
})
export class SidenavComponent implements OnInit {
    @Input()
    data: { mode?: 'collapsed' | 'expanded' } = { mode: 'expanded' };

    navbarMenuItemGroups$: Observable<NavBarGroupRef[]>;

    private readonly destroyRef = inject(DestroyRef);

    private readonly sidenavExtensionService = inject(SidenavExtensionService);
    private readonly extensionService = inject(ExtensionService);

    ngOnInit() {
        this.extensionService.setup$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((config: ExtensionConfig) => {
            this.sidenavExtensionService.loadSidenavItems(config.features?.navbar ?? []);
            this.navbarMenuItemGroups$ = this.sidenavExtensionService.sidenavGroups$;
        });
    }
}
