/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BreadcrumbComponent, BreadcrumbItemComponent } from '@alfresco/adf-core/breadcrumbs';
import { NgFor, NgIf } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DocumentRouterPipe } from './pipes/document-router.pipe';
import { BreadcrumbLabelPipe } from '../../pipes/breadcrumb-label.pipe';

/**
 * Component presents document breadcrumb.
 * To use the `HxpUiBreadcrumbComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { HxpUiBreadcrumbComponent } from '@alfresco/adf-hx-content-services/icons';
 * @NgModule({
 *     imports: [
 *         HxpUiBreadcrumbComponent
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
 * <hxp-ui-breadcrumb [documents]="documents"></hxp-ui-breadcrumb>
 */

@Component({
    selector: 'hxp-ui-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [BreadcrumbComponent, NgFor, BreadcrumbItemComponent, NgIf, RouterLink, DocumentRouterPipe, BreadcrumbLabelPipe],
})
export class HxpUiBreadcrumbComponent {
    /**
     * List of `Document` object the breadcrumb is rendered from.
     * @type {Document}
     */
    @Input() documents: Array<Document> = [];

    /**
     * If true, breadcrumb elements are grouped together and displayed as ellipsis, except for the first and last entry.
     * @default false
     * @type {boolean}
     */
    @Input() compact = false;

    protected documentTrackBy(_index: number, document: Document) {
        return document?.sys_id;
    }
}
