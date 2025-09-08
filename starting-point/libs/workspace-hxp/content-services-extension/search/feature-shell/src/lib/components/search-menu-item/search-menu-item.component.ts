/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectorRef, Component, DestroyRef, inject, Input, NgZone, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { SidenavExpansionService } from '@hxp/workspace-hxp/shared/services';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, map, startWith } from 'rxjs/operators';

const SEARCH_ROUTE = '/search';

@Component({
    standalone: true,
    selector: 'hxp-search-menu-item',
    templateUrl: './search-menu-item.component.html',
    styleUrls: ['./search-menu-item.component.scss'],
    imports: [MatButtonModule, MatIconModule, TranslatePipe],
})
export class SearchMenuItemComponent implements OnInit {
    @Input()
    data: any;

    private readonly zone = inject(NgZone);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly cdRef = inject(ChangeDetectorRef);
    private readonly sidenavExpansionService = inject(SidenavExpansionService);

    protected isSideNavExpanded = this.sidenavExpansionService.isSideNavExpanded();
    protected isSearchRouteActive = false;

    constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        const icons: Record<string, string> = {
            repository_search: 'assets/search-icons/Repository_search.svg',
        };

        for (const [iconName, iconPath] of Object.entries(icons)) {
            this.matIconRegistry.addSvgIcon(iconName, this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath));
        }
    }

    ngOnInit(): void {
        this.router.events
            .pipe(
                map((event) => (event instanceof NavigationEnd ? event.url : null)),
                startWith(this.router.url),
                filter((url) => !!url),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((url) => {
                this.isSearchRouteActive = !!url?.includes(SEARCH_ROUTE);
                this.cdRef.detectChanges();
            });
    }

    isExpanded(): boolean {
        return this.data?.state === 'expanded';
    }

    navigateToSearch(): void {
        this.zone.run(() => {
            void this.router.navigate([SEARCH_ROUTE], { queryParams: { type: 'basic', q: '' } });
        });
    }
}
