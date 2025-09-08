/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-page-layout-content',
    template: `<ng-content />`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'app-page-layout-content' },
})
export class PageLayoutContentComponent {
    @Input()
    @HostBinding('class.app.scrollable')
    scrollable = false;
}
