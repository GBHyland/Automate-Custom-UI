/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    standalone: true,
    selector: 'apa-scroll-container',
    templateUrl: './scroll-container.component.html',
    styleUrls: ['./scroll-container.component.scss'],
    host: { class: 'apa-cloud-scroll-container' },
    encapsulation: ViewEncapsulation.None,
})
export class ScrollContainerComponent {}
