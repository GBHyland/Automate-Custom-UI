/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { PermissionLevelPipe } from './permission-level.pipe';
import { Component, importProvidersFrom, Input } from '@angular/core';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { I18nModule } from '../config/storybook/i18n.module';

const documents = {
    Everything: { ...mocks.fileDocument, sys_effectivePermissions: ['ManageSecurity'] },
    Read: { ...mocks.fileDocument, sys_effectivePermissions: ['Read'] },
    ReadWrite: { ...mocks.fileDocument, sys_effectivePermissions: ['ReadWrite'] },
    None: { ...mocks.fileDocument, sys_effectivePermissions: [] },
};

const mockTemplate = `<span class="hxp-permission-{{ (document.sys_effectivePermissions | permissionLevel)?.class || 'none' }}">
                    {{ (document.sys_effectivePermissions | permissionLevel).value | translate }}</span>`;

@Component({
    selector: 'hxp-permission',
    template: mockTemplate,
    styles: [
        `
            .hxp-permission-everything {
                background: #e9d5ff;
            }

            .hxp-permission-none {
                background: #ffffff;
            }

            .hxp-permission-read {
                background: #e5e7eb;
            }

            .hxp-permission-readWrite {
                background: #ecfccb;
            }
        `,
    ],
    standalone: true,
    imports: [PermissionLevelPipe, I18nModule],
})
class MockPermissionLevelComponent {
    @Input() document: Document[] = [];
}

export default {
    title: 'Pipes/PermissionLevel',
    component: MockPermissionLevelComponent,
    tags: ['!autodocs'],
    decorators: [
        applicationConfig({
            providers: [importProvidersFrom(I18nModule)],
        }),
        moduleMetadata({
            imports: [MockPermissionLevelComponent, PermissionLevelPipe, NoopTranslateModule],
        }),
    ],
    argTypes: {
        document: {
            options: Object.keys(documents),
            control: {
                type: 'select',
            },
            mapping: documents,
        },
    },
} as Meta<MockPermissionLevelComponent>;

export const PermissionLevel = {
    render: (args: MockPermissionLevelComponent) => ({
        props: args,
    }),
    args: {
        document: documents['Everything'],
    },
};
