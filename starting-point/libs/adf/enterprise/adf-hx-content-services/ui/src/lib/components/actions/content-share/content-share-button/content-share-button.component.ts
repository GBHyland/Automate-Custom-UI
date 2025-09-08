/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, Input, OnChanges } from '@angular/core';
import { ActionContext, DocumentActionService, HXP_DOCUMENT_SHARE_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
/**
 * Component icon button that shows a dialog to share a `Document` url.
 *
 * To display the component, the `actionContext` input property must provide only one `Document` in the `documents` array,
 * and the current logged in user must have `READ` permission on the `Document`.
 *
 * To use the `ContentShareButtonComponent`, import the component in your module
 *
 * ```ts
 * import { ContentShareButtonComponent } from '@alfresco/adf-hx-content-services/ui';
 *
 * @NgModule({
 *     imports: [
 *         ContentShareButtonComponent,
 *         ...
 *     ],
 * })
 * export class AppModule {}
 * ```
 *
 * Use it in your Angular template as shown in the example below:
 *
 * @example
 * <hxp-single-file-share [actionContext]="actionContext"></hxp-single-file-share>
 *
 */
@Component({
    selector: 'hxp-single-file-share',
    templateUrl: './content-share-button.component.html',
    standalone: true,
    imports: [NgIf, MatButtonModule, MatTooltipModule, MatIconModule, TranslatePipe],
})
export class ContentShareButtonComponent implements OnChanges {
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

    constructor(@Inject(HXP_DOCUMENT_SHARE_ACTION_SERVICE) private contentShareButtonActionService: DocumentActionService) {}

    ngOnChanges(): void {
        this.isAvailable = this.contentShareButtonActionService.isAvailable(this.actionContext);
    }

    protected onShare() {
        this.contentShareButtonActionService.execute(this.actionContext);
    }
}
