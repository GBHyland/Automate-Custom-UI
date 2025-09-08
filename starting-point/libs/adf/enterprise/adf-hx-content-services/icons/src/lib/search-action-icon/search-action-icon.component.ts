/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, OnChanges } from '@angular/core';
import { SearchIcon, SearchIconAssets } from '../configs/search-icons.config';
import { TranslateService } from '@ngx-translate/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Component representing a search action icon.
 *
 * To use the `SearchActionIconComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { SearchActionIconComponent } from '@alfresco/adf-hx-content-services/icons';
 * @NgModule({
 *     imports: [
 *         SearchActionIconComponent,
 *         ...
 *     ],
 *    [...]
 * })
 * export class AppModule {}
 * ```
 *
 * Then use it in your Angular template as shown in the example below:
 *
 * @example
 *  <hxp-search-action-icon></hxp-search-action-icon>
 *
 */
@Component({
    selector: 'hxp-search-action-icon',
    templateUrl: './search-action-icon.component.html',
    styleUrls: ['./search-action-icon.component.scss'],
    standalone: true,
})
export class SearchActionIconComponent implements OnChanges {
    /**
     * Icon to display: `SEARCH` or `CLEAR`.
     * @type {string}
     * @default 'SEARCH'
     *
     */
    @Input()
    actionIcon: SearchIcon;
    /**
     * A custom text for HTML <img> alt attribute.
     * @type {string}
     *
     */
    @Input()
    actionAlt = '';

    protected alt = '';
    protected iconAssetPath: string;

    constructor(private translateService: TranslateService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
        this.actionIcon = 'SEARCH';
        this.iconAssetPath = SearchIconAssets[this.actionIcon];
        const icons: Record<string, string> = {
            search_calendar: 'assets/search-icons/Calendar_search.svg',
            search_clear: 'assets/search-icons/Clear.svg',
            search_glass: 'assets/search-icons/Search.svg',
            search_arrow_left: 'assets/search-icons/Arrow_left.svg',
            repository_search: 'assets/search-icons/Repository_search.svg',
        };

        for (const [iconName, iconPath] of Object.entries(icons)) {
            this.matIconRegistry.addSvgIcon(iconName, this.domSanitizer.bypassSecurityTrustResourceUrl(iconPath));
        }
    }

    ngOnChanges() {
        this.iconAssetPath = SearchIconAssets[this.actionIcon];
        this.alt =
            this.actionAlt ||
            (this.actionIcon === 'SEARCH'
                ? this.translateService.instant('SEARCH.ICON.SEARCH')
                : this.translateService.instant('SEARCH.ICON.CLEAR_INPUT'));
    }
}
