/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContentActionRef } from '@alfresco/adf-extensions';
import { Component, Input } from '@angular/core';
import { ActionContext } from '@alfresco/adf-hx-content-services/services';
import { NgIf, NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DocumentMoreMenuItemComponent } from '../document-more-menu-item/document-more-menu-item.component';

/**
 * Component that display a menu on click, built on top of Alfresco Extensions API (https://www.alfresco.com/abn/adf/docs/extensions/components/dynamic.component/).
 *
 * To use the `DocumentMoreActionComponent`, first create a module to register your custom components using Alfresco `ExtensionService`:
 *
 * ```ts
 * import { NgModule } from '@angular/core';
 * import { ExtensionService } from '@alfresco/adf-extensions';
 *
 * @NgModule({})
 * export class ExtensionsRegisterModule {
 *     constructor(private readonly extensions: ExtensionService) {
 *         this.extensions.setComponents({
 *             'action.one': ActionOneButtonComponent,
 *             'action.two': ActionTwoButtonComponent,
 *         });
 *     }
 * }
 * ```
 * The components should provide a `data` Input property to receive the `ActionContext` object.
 * Example:
 *
 * ```ts
 * import { Component, Input } from '@angular/core';
 * import { ActionContext } from '@alfresco/adf-hx-content-services/services';
 *
 * @Component({
 *   template: '<button (click)="sayHello()">{{ data.documents[0].sys_title }}</button>',
 *   standalone: true,
 * })
 * class ActionTwoButtonComponent {
 *    @Input() data: ActionContext;
 *
 *    sayHello() {
 *        console.log(`Hello world! Here is ${data?.documents[0]?.sys_title}, nice to meet you!`);
 *    }
 * }
 * ```
 *
 * Then import your customized `ExtensionsRegisterModule` and the `DocumentMoreActionComponent` component in your module
 *
 * ```ts
 * import { DocumentMoreActionComponent } from '@alfresco/adf-hx-content-services/ui';
 * import { ExtensionsRegisterModule } from './extensions-register.module';
 *
 * @NgModule({
 *     imports: [
 *         ExtensionsRegisterModule,
 *         DocumentMoreActionComponent,
 *         ...
 *     ],
 *    [...]
 * })
 * export class AppModule {}
 * ```
 *
 * Use it in your Angular template as shown in the example below:
 *
 * @example
 * <hxp-document-more-action [menuItems]="menuItems" [actionContext]="actionContext"></hxp-document-more-action>
 *
 */
@Component({
    selector: 'hxp-document-more-action',
    templateUrl: './document-more-action.component.html',
    standalone: true,
    imports: [NgIf, MatButtonModule, MatMenuModule, MatIconModule, NgFor, DocumentMoreMenuItemComponent],
})
export class DocumentMoreActionComponent {
    /**
     * Input property that accepts an Alfresco Extensions Features Object
     * https://www.alfresco.com/abn/adf/docs/user-guide/app-extensions/#features
     * @required
     * @type {ContentActionRef}
     *
     * @example
     * {
     *      id: 'app.document.more',
     *      type: 'menu',
     *      order: 10_000,
     *      icon: 'more_vert',
     *      title: 'APP.ACTIONS.MORE',
     *      children: [
     *          {
     *              id: 'action.one',
     *              order: 200,
     *              type: 'custom',
     *              component: 'action.one',
     *          },
     *          {
     *              id: 'action.two',
     *              order: 200,
     *              type: 'custom',
     *              component: 'action.two'
     *          }
     *      ]
     * }
     *
     */
    @Input() menuItems!: ContentActionRef;
    /**
     * Input property which specifies an `ActionContext` object
     * An `ActionContext` object must provide a list of documents.
     * The object is passed as `data` input property to the registered components.
     * @type {ActionContext}
     *
     * @example
     * interface ActionContext {
     *     documents: Document[];
     *     parentDocument?: Document;
     *     shouldRedirect?: boolean;
     *     refererURL?: string;
     *     showPanel?: 'property' | 'version';
     * }
     *
     */
    @Input() actionContext: ActionContext = { documents: [] };

    protected childTrackBy(_index: number, child: ContentActionRef) {
        return child.id;
    }
}
