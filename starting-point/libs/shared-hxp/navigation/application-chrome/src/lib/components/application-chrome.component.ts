/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, Input, signal, ViewEncapsulation, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SatIconModule, SatPlatformNavModule } from '@hylandsoftware/satori-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LogoutDirective } from '@alfresco/adf-core';
import { UserInfoService } from '../services/user-info.service';
import { TranslatePipe } from '@ngx-translate/core';
import { NavigationService } from '../services/navigation.service';
import { AppListService } from '../services/app-list.service';
import { ContextAppsPipe } from '../pipes/context-apps.pipe';
import { NavEnvsPipe } from '../pipes/nav-envs.pipe';
import { CONTROL_CENTER } from '../configs/control-center.app-env.config';
import { EnvAppsPipe } from '../pipes/env-apps.pipe';
import { provideNavIcons } from '../utils/provide-nav-icons.util';
import { NavIconPipe } from '../pipes/nav-icon.pipe';
import { ContextEnvsPipe } from '../pipes/context-envs.pipe';
import { NeutralThemePipe } from '../pipes/neutral-theme.pipe';
import { provideControlCenter } from '../providers/control-center.provider';
import { provideHome } from '../providers/home.provider';
import { HOME_CONTEXT_NAME } from '../configs/home.context-name.config';
import { NavActivePipe } from '../pipes/nav-active.pipe';
import { AppEnvService } from '../services/app-env.service';
import { InitialEnvPipe } from '../pipes/initial-env.pipe';
import { DisplayModeService, FormCloudDisplayMode } from '@alfresco/adf-process-services-cloud';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-application-chrome',
    standalone: true,
    imports: [
        CommonModule,
        SatPlatformNavModule,
        SatIconModule,
        MatIconModule,
        MatMenuModule,
        LogoutDirective,
        TranslatePipe,
        ContextAppsPipe,
        ContextEnvsPipe,
        NavEnvsPipe,
        EnvAppsPipe,
        NavIconPipe,
        NeutralThemePipe,
        NavActivePipe,
        InitialEnvPipe,
    ],
    providers: [...provideNavIcons(), provideControlCenter(CONTROL_CENTER), provideHome(HOME_CONTEXT_NAME), DisplayModeService],
    templateUrl: './application-chrome.component.html',
    styleUrls: ['./application-chrome.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ApplicationChromeComponent implements OnInit {
    public readonly appListService = inject(AppListService);
    public readonly appEnvService = inject(AppEnvService);
    public readonly userInfoService = inject(UserInfoService);
    public readonly navigationService = inject(NavigationService);
    public readonly hideChromeBar = signal(false);

    @Input() featureFlagOn = false;

    private destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        DisplayModeService.displayMode$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((change) => {
            const isHidden = change.displayMode === FormCloudDisplayMode.fullScreen || change.displayMode === FormCloudDisplayMode.standalone;
            this.hideChromeBar.set(isHidden);
        });
    }
}
