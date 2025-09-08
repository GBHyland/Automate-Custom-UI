/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';
import { ChangeDetectorRef, Component, DestroyRef, Inject, Input, NgZone, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { SidenavExpansionService } from '@hxp/workspace-hxp/shared/services';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, map, startWith } from 'rxjs/operators';
import { GovernancePermissionService } from '../../config/governance-permission.service';

const GOVERNANCE_SEARCH_ROUTE = '/governance';

@Component({
    standalone: true,
    selector: 'hxp-governance-sidenav-menu-item',
    templateUrl: './sidenav-menu-item.component.html',
    styleUrls: ['./sidenav-menu-item.component.scss'],
    imports: [MatButtonModule, MatIconModule, TranslatePipe],
})
export class GovernanceSidenavMenuItemComponent implements OnInit {
    @Input()
    data: any;

    protected isSideNavExpanded: boolean;
    protected isSearchRouteActive = false;
    protected isGovernanceFeatureFlagOn = false;
    protected hasPermission!: boolean;

    constructor(
        private readonly cdRef: ChangeDetectorRef,
        private zone: NgZone,
        private router: Router,
        private sidenavExpansionService: SidenavExpansionService,
        @Inject(FeaturesServiceToken)
        private featuresService: IFeaturesService,
        private destroyRef: DestroyRef,
        private permissionService: GovernancePermissionService
    ) {
        this.isSideNavExpanded = this.sidenavExpansionService.isSideNavExpanded();

        this.featuresService.isOn$(ADF_HX_CONTENT_SERVICES_INTERNAL.CIC_GOVERNANCE_WORKSPACE_EXTENSION).subscribe((isOn) => {
            this.isGovernanceFeatureFlagOn = isOn;
        });
    }

    ngOnInit(): void {
        this.permissionService.hasGovernanceAccess().subscribe((hasAccess) => {
            this.hasPermission = hasAccess;
            this.cdRef.detectChanges();
        });

        this.router.events
            .pipe(
                map((event) => (event instanceof NavigationEnd ? event.url : null)),
                startWith(this.router.url),
                filter((url) => !!url),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((url) => {
                this.isSearchRouteActive = !!url?.includes(GOVERNANCE_SEARCH_ROUTE);
                this.cdRef.detectChanges();
            });
    }

    isExpanded(): boolean {
        return this.data?.state === 'expanded';
    }

    navigateToSearch(): void {
        this.zone.run(() => {
            void this.router.navigate([GOVERNANCE_SEARCH_ROUTE]);
        });
    }
}
