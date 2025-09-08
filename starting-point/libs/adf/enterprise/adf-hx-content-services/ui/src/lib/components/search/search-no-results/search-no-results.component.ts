/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CustomEmptyContentTemplateDirective, EmptyContentComponent } from '@alfresco/adf-core';
import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'hxp-search-no-results',
    templateUrl: './search-no-results.component.html',
    styleUrls: ['./search-no-results.component.scss'],
    imports: [EmptyContentComponent, CustomEmptyContentTemplateDirective],
})
export class SearchNoResultsComponent {}
