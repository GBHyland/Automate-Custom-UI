/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, Input, OnChanges } from '@angular/core';
import { ActionContext, HXP_DOCUMENT_INFO_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { ContentPropertyViewerActionService } from './content-properties-viewer-button-action.service';

/**
 * Component icon button that triggers an event to display the Document Properties Sidebar.
 *
 * To display the component, the `actionContext` input property must provide only one `Document` in the `documents` array,
 * and the current logged in user must have `READ` permission on the `Document`.
 *
 * To use the `ContentPropertiesViewerButtonComponent`, import the component in your module along with `HxpPropertiesSidebarComponent`.
 *
 * ```ts
 * import { ContentPropertiesViewerButtonComponent, HxpPropertiesSidebarComponent } from '@alfresco/adf-hx-content-services/ui';
 *
 * @NgModule({
 *     imports: [
 *         ContentPropertiesViewerButtonComponent,
 *         HxpPropertiesSidebarComponent,
 *         ...
 *     ],
 * })
 * export class AppModule {}
 * ```
 *
 * Inject the `ContentPropertyViewerActionService` in your component as shown in the example below.
 * Subscribe to `showPropertyPanel$` service stream to update the `ActionContext` object with the new value.
 *
 * ```ts
 * import { ActionContext, ContentPropertyViewerActionService, HXP_DOCUMENT_INFO_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
 * import { Subject } from 'rxjs';
 * import { takeUntil } from 'rxjs/operators';
 *
 * @Component({
 *   template: '
 *       <hxp-content-properties-viewer-button [actionContext]="actionContext"></hxp-content-properties-viewer-button>
 *       <hxp-properties-sidebar
 *           *ngIf="actionContext?.showPanel === 'property'"
 *           [document]="actionContext?.documents[0]"
 *           (closePropertySidebar)="closePropertiesSidebar()"
 *           >
 *        </hxp-properties-sidebar>
 * ',
 * })
 * export class YourComponent implements OnDestroy {
 *
 *     actionContext: ActionContext = { documents: [] };
 *
 *     private destroyed$: Subject<void> = new Subject<void>();
 *
 *     constructor(@Inject(HXP_DOCUMENT_INFO_ACTION_SERVICE) private contentPropertyViewerActionService: ContentPropertyViewerActionService) {
 *         this.subscribeToShowPropertyPanelStatus();
 *     }
 *
 *     ngOnDestroy() {
 *         this.destroyed$.next();
 *         this.destroyed$.complete();
 *     }
 *
 *     [...]
 *
 *     closePropertiesSidebar(): void {
 *         this.actionContext = { ...this.actionContext, showPanel: undefined };
 *         this.contentPropertyViewerActionService.execute(this.actionContext);
 *     }
 *
 *     private subscribeToShowPropertyPanelStatus(): void {
 *         this.contentPropertyViewerActionService.showPropertyPanel$
 *             .pipe(takeUntil(this.destroyed$))
 *             .subscribe({
 *                  next: (showPropertyPanel) => {
 *                      this.actionContext = { ...this.actionContext, showPanel : showPropertyPanel ? 'property' : undefined };
 *                  },
 *                  error: (error) => console.error(error)
 *         });
 *     }
 * }
 * ```
 *
 */

@Component({
    selector: 'hxp-content-properties-viewer-button',
    templateUrl: './content-properties-viewer-button.component.html',
    standalone: true,
    imports: [NgIf, MatButtonModule, MatTooltipModule, MatIconModule, TranslatePipe],
})
export class ContentPropertiesViewerButtonComponent implements OnChanges {
    /**
     * Input property which specifies an `ActionContext` object
     * The `ActionContext` object should provide an array containing only one `Document`.
     *
     * Optionally the object can provide the `showPanel` to forcefully trigger an event to display or hidden the Properties Viewer.
     * @type {ActionContext}
     *
     * @example
     * interface ActionContext {
     *     documents: Document[];
     *     showPanel?: 'property' | 'version';
     * }
     *
     */
    @Input() actionContext: ActionContext = { documents: [] };

    protected isAvailable = false;

    constructor(
        @Inject(HXP_DOCUMENT_INFO_ACTION_SERVICE)
        private contentPropertyViewerActionService: ContentPropertyViewerActionService
    ) {}

    ngOnChanges(): void {
        this.isAvailable = this.contentPropertyViewerActionService.isAvailable(this.actionContext);
    }

    protected showInfo(): void {
        this.contentPropertyViewerActionService.execute({ ...this.actionContext, showPanel: 'property' });
    }
}
