/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, OnInit } from '@angular/core';
import { UserAppsService } from '../../services/user-apps-list.service';
import { UserApps } from '../../interfaces/apps.interface';
import { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { HeaderMenuComponent } from '../header-menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { SatLogoComponent, SatWordMarkLogoComponent } from '@hylandsoftware/satori-ui';
import { HXP_DOCUMENTATION_URL } from '@alfresco-dbp/shared-core';
import { AsyncPipe } from '@angular/common';

@Component({
    standalone: true,
    selector: 'hxp-header-legacy',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [
        RouterModule,
        TranslatePipe,
        MatMenuModule,
        MatToolbarModule,
        MatDividerModule,
        HeaderMenuComponent,
        SatLogoComponent,
        SatWordMarkLogoComponent,
        AsyncPipe,
    ],
})
export class HxpHeaderComponent implements OnInit {
    userApps$: Observable<UserApps[]> = EMPTY;
    documentationUrl = HXP_DOCUMENTATION_URL;
    private readonly userAppsService = inject(UserAppsService);

    ngOnInit(): void {
        this.userApps$ = this.userAppsService.getUserAppsData();
    }
}
