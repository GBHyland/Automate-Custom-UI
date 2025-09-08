/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExtensionService } from '@alfresco/adf-extensions';
import { ActionContext } from '@alfresco/adf-hx-content-services/services';
import { Component, importProvidersFrom, Input, NgModule } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { I18nModule } from '../../../../configs/storybook/i18n.module';
import { DocumentMoreActionComponent } from './document-more-action.component';

const { sys_id, sys_title } = mocks.fileDocument;

const exampleDocument: Partial<Document> = {
    sys_id,
    sys_title,
    sys_effectivePermissions: ['READ'],
};

@NgModule({})
export class StoryBookExtensionsModule {
    constructor(private readonly extensions: ExtensionService) {
        this.extensions.setComponents({
            'action.one': ActionOneButtonComponent,
            'action.two': ActionTwoButtonComponent,
        });
    }
}

@Component({
    template: '<button style="width: 100%; background-color: darkorange; padding: 2px">Custom Action Button 1</button>',
    standalone: true,
})
class ActionOneButtonComponent {}

@Component({
    template:
        '<button (click)="sayHello()" style="width: 100%; background-color: deepskyblue; padding: 2px">{{ data.documents[0].sys_title }} Button 2</button>',
    standalone: true,
})
class ActionTwoButtonComponent {
    @Input() data!: ActionContext;

    sayHello() {
        const { documents } = this.data;
        // eslint-disable-next-line no-console
        console.log(`Hello world! Here is ${documents[0]?.sys_title}, nice to meet you!`);
    }
}

export default {
    title: 'Ui/Actions/More Menu',
    component: DocumentMoreActionComponent,
    decorators: [
        applicationConfig({
            providers: [importProvidersFrom(I18nModule), provideAnimations()],
        }),
        moduleMetadata({
            imports: [StoryBookExtensionsModule],
        }),
    ],
} as Meta<DocumentMoreActionComponent>;

export const ConfigurationExample = {
    render: (args: DocumentMoreActionComponent) => ({
        props: args,
    }),
    args: {
        actionContext: {
            documents: [exampleDocument],
        },
        menuItems: {
            id: 'app.document.more',
            type: 'menu',
            order: 10_000,
            icon: 'more_vert',
            title: 'APP.ACTIONS.MORE',
            children: [
                {
                    id: 'action.one',
                    order: 200,
                    type: 'custom',
                    component: 'action.one',
                },
                {
                    id: 'action.two',
                    order: 200,
                    type: 'custom',
                    component: 'action.two',
                },
            ],
        },
    },
};
