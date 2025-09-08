/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, TemplateRef, ContentChild } from '@angular/core';

@Component({
    selector: 'hxp-data-column',
    standalone: true,
    template: '',
    imports: [],
})
export class DataColumnComponent {
    @Input() key!: string;
    @Input() title!: string;
    @Input() sortable = false;
    @Input() width?: string;

    @ContentChild(TemplateRef) template!: TemplateRef<any>;
}
