/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FilterParamsModel } from '@alfresco/adf-process-services-cloud';
import { Component, DestroyRef, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, startWith } from 'rxjs/operators';
import { PROCESS_ROUTE, TASKS_ROUTE } from '../../constants/extensions.const';
import { selectApplicationName, selectProcessManagementFilter } from '../../store/process-service-cloud.selectors';
import { TranslatePipe } from '@ngx-translate/core';
import { SidenavTaskListComponent } from '../sidenav-task-list/sidenav-task-list.component';
import { SidenavProcessListComponent } from '../sidenav-process-list/sidenav-process-list.component';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from '@alfresco/adf-core';
import { MatMenuModule } from '@angular/material/menu';
import { NgIf } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    imports: [
        TranslatePipe,
        SidenavTaskListComponent,
        SidenavProcessListComponent,
        MatButtonModule,
        IconComponent,
        MatMenuModule,
        NgIf,
        MatExpansionModule,
    ],
    templateUrl: './sidenav-process-management.component.html',
    styleUrls: ['./sidenav-process-management.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SidenavProcessManagementComponent implements OnInit {
    @Input() data: any;

    currentFilter: FilterParamsModel = {};
    appName?: string;
    isProcessRouteActive = false;
    isTasksRouteActive = false;

    private readonly destroyRef = inject(DestroyRef);

    constructor(private readonly store: Store<any>, private router: Router) {}

    ngOnInit(): void {
        this.router.events
            .pipe(
                map((event) => (event instanceof NavigationEnd ? event.url : null)),
                startWith(this.router.url),
                filter((url) => !!url),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((url) => {
                this.isProcessRouteActive = !!url?.includes(PROCESS_ROUTE);
                this.isTasksRouteActive = !!url?.includes(TASKS_ROUTE);
            });

        this.store
            .select(selectProcessManagementFilter)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((currentFilter) => {
                this.currentFilter = { ...currentFilter };
            });

        this.store
            .select(selectApplicationName)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((appName) => {
                this.appName = appName;
            });
    }
}
