/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ADF_HX_CONTENT_SERVICES_API_PROVIDERS, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { User } from '@hylandsoftware/hxcs-js-client';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { of } from 'rxjs';
import { UserService } from '../user/user.service';
import { UserResolverPipe } from './user-resolver.pipe';
import { USER_RESOLVER_PROVIDERS } from '../..';

const user = {
    id: 'c5fee88f-102f-42c3-923d-3ee2dfcb52a2',
    firstName: 'test',
    lastName: 'user',
    email: 'testuser@hyland.com',
};

@Component({
    selector: 'hxp-user',
    template: `<p>{{ user | hxpUserResolverPipe }}</p>`,
    standalone: true,
    imports: [CommonModule, UserResolverPipe],
})
class MockUserResolverComponent {
    @Input() user!: User;
}

export default {
    title: 'Pipes/UserResolver',
    component: MockUserResolverComponent,
    tags: ['!autodocs'],
    decorators: [
        applicationConfig({
            providers: [mockHxcsJsClientConfigurationService, ...ADF_HX_CONTENT_SERVICES_API_PROVIDERS],
        }),
        moduleMetadata({
            providers: [
                ...USER_RESOLVER_PROVIDERS,
                {
                    provide: UserService,
                    useValue: {
                        resolveUser: () => {
                            return of({ firstName: 'test', lastName: 'user' } as Partial<User>);
                        },
                    },
                },
            ],
        }),
    ],
} as Meta<any>;

export const UserResolver = {
    render: (args: MockUserResolverComponent) => ({
        props: args,
    }),
    args: {
        user: user,
    },
};
