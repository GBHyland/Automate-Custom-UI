/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionContext, HXP_DOCUMENT_INFO_ACTION_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { APP_INITIALIZER, importProvidersFrom, Injectable, Injector } from '@angular/core';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { applicationConfig, Meta } from '@storybook/angular';
import { distinctUntilChanged, skip } from 'rxjs/operators';
import { I18nModule } from '../../../configs/storybook/i18n.module';
import { ContentPropertiesViewerButtonComponent } from './content-properties-viewer-button.component';
import { ContentPropertyViewerActionService } from './content-properties-viewer-button-action.service';

@Injectable({
    providedIn: 'root',
})
class OpenViewerService {
    actionContext: ActionContext = { documents: [] };
    private contentPropertyViewerActionService: ContentPropertyViewerActionService;

    constructor(injector: Injector) {
        this.contentPropertyViewerActionService = injector.get(HXP_DOCUMENT_INFO_ACTION_SERVICE) as ContentPropertyViewerActionService;
        this.subscribeToShowPropertyPanelStatus();
    }
    private subscribeToShowPropertyPanelStatus(): void {
        this.contentPropertyViewerActionService.showPropertyPanel$.pipe(skip(1), distinctUntilChanged()).subscribe({
            next: (showPropertyPanel) => {
                alert(`An event has been triggered, showPropertyPanel value is: ${showPropertyPanel}`);
            },
            error: (error) => console.error(error),
        });
    }
}

export default {
    title: 'Ui/Actions/Content Properties Viewer Button',
    component: ContentPropertiesViewerButtonComponent,
    decorators: [
        applicationConfig({
            providers: [
                importProvidersFrom(I18nModule),
                {
                    provide: HXP_DOCUMENT_INFO_ACTION_SERVICE,
                    useClass: ContentPropertyViewerActionService,
                },
                {
                    provide: APP_INITIALIZER,
                    useFactory: (injector: Injector) => () => {
                        return new OpenViewerService(injector);
                    },
                    deps: [Injector],
                    multi: true,
                },
            ],
        }),
    ],
} as Meta<ContentPropertiesViewerButtonComponent>;

export const ViewerButton = {
    render: (args: ContentPropertiesViewerButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [mocks.fileDocument] },
    },
};

export const MissingViewerButtonAsDocumentUnavailable = {
    render: (args: ContentPropertiesViewerButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [] },
    },
};

export const MissingViewerButtonAsPermissionNotGiven = {
    render: (args: ContentPropertiesViewerButtonComponent) => ({
        props: args,
    }),
    args: {
        actionContext: { documents: [{ ...mocks.fileDocument, sys_effectivePermissions: [] }] },
    },
};
