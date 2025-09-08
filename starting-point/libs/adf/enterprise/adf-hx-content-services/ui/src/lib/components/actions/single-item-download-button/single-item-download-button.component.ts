/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionContext, DocumentActionService, HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { NgIf } from '@angular/common';
import { Component, Inject, Input, OnChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Component icon button that downloads a `Document` file. Success or error action result status is notified to the user.
 *
 * To display the component:
 * - the `actionContext` input property must provide only one `Document` in the `documents` array;
 * - the `Document` must have a valid blob to download;
 * - the current logged in user must have `READ` permission on the `Document`.
 *
 * To use the `SingleItemDownloadButtonComponent`, import the component in your module
 *
 * ```ts
 * import { SingleItemDownloadButtonComponent } from '@alfresco/adf-hx-content-services/ui';
 *
 * @NgModule({
 *     imports: [
 *         SingleItemDownloadButtonComponent,
 *         ...
 *     ],
 * })
 * export class AppModule {}
 * ```
 *
 * Use it in your Angular template as shown in the example below:
 *
 * @example
 * <hxp-single-item-download [actionContext]="actionContext"></hxp-single-item-download>
 *
 */
@Component({
    selector: 'hxp-single-item-download',
    templateUrl: './single-item-download-button.component.html',
    standalone: true,
    imports: [NgIf, MatButtonModule, MatTooltipModule, MatIconModule, TranslatePipe],
})
export class SingleItemDownloadButtonComponent implements OnChanges {
    /**
     * Input property which specifies an `ActionContext` object
     * The `ActionContext` object should provide an array containing only one `Document`.
     * @type {ActionContext}
     *
     * @example
     * interface ActionContext {
     *     documents: Document[];
     * }
     *
     */
    @Input() actionContext: ActionContext = { documents: [] };

    protected isAvailable = false;

    constructor(
        @Inject(HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE)
        private singleItemDownloadButtonActionService: DocumentActionService
    ) {}

    ngOnChanges(): void {
        this.isAvailable = this.singleItemDownloadButtonActionService.isAvailable(this.actionContext);
    }

    protected onDownload(): void {
        this.singleItemDownloadButtonActionService.execute(this.actionContext);
    }
}
