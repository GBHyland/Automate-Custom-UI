/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ClipboardService, INFO_DRAWER_DIRECTIVES, NotificationService } from '@alfresco/adf-core';
import { FieldType, mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { DOCUMENT_PROPERTIES_SERVICE, DOCUMENT_SERVICE } from '@alfresco/adf-hx-content-services/services';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { of } from 'rxjs';
import { I18nModule } from '../../configs/storybook/i18n.module';
import { defaultPropertiesMock } from '../../configs/storybook/properties-management.mock';
import { PropertiesViewerContainerComponent } from './properties-viewer-container.component';

export default {
    title: 'Ui/Properties Management/Viewer',
    component: PropertiesViewerContainerComponent,
    decorators: [
        applicationConfig({
            providers: [importProvidersFrom(I18nModule), provideAnimations(), MatSnackBar],
        }),
        moduleMetadata({
            imports: [...INFO_DRAWER_DIRECTIVES],
            providers: [
                mockHxcsJsClientConfigurationService,
                ClipboardService,
                NotificationService,
                {
                    provide: DOCUMENT_SERVICE,
                    useValue: {
                        updateDocument: () => {
                            return of({ ...mocks.fileDocument, sys_title: 'Home' });
                        },
                    },
                },
                {
                    provide: DOCUMENT_PROPERTIES_SERVICE,
                    useValue: {
                        getRequiredProperties: (): string[] => {
                            return ['sys_title', 'sysfile_blob.filename'];
                        },
                        propertyType: () => {
                            return FieldType.String;
                        },
                        isFieldTypeArray: () => {},
                    },
                },
            ],
        }),
    ],
} as Meta<PropertiesViewerContainerComponent>;

export const ReadonlyProperty = {
    render: (args: PropertiesViewerContainerComponent) => ({
        props: args,
    }),
    args: {
        properties: defaultPropertiesMock,
        editable: false,
        expanded: true,
    },
};

export const EditableProperty = {
    render: (args: PropertiesViewerContainerComponent) => ({
        props: args,
    }),
    args: {
        properties: defaultPropertiesMock,
        editable: true,
        expanded: true,
        document: mocks.fileDocument,
    },
};

export const CollapsedProperty = {
    render: (args: PropertiesViewerContainerComponent) => ({
        props: args,
    }),
    args: {
        properties: defaultPropertiesMock,
        editable: false,
        expanded: false,
    },
};
