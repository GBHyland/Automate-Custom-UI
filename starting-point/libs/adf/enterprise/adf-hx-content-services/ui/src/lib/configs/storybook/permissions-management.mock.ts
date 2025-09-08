/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { provideTranslations, UserPreferencesService } from '@alfresco/adf-core';
import {
    copyApiProvider,
    documentApiProvider,
    GROUP_API_TOKEN,
    groupApiProvider,
    mockHxcsJsClientConfigurationService,
    moveApiProvider,
    queryApiProvider,
    USER_API_TOKEN,
    userApiProvider,
} from '@alfresco/adf-hx-content-services/api';
import { DocumentService, IDENTITY_USER_SERVICE_TOKEN, PermissionsPanelRequestService } from '@alfresco/adf-hx-content-services/services';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { MockProvider } from 'ng-mocks';
import { firstValueFrom, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { I18nModule } from './i18n.module';

const { sys_acl, sys_effectiveAcl, sys_id, sys_title } = mocks.documentWithAcl;

export const documentWithAcl = {
    sys_id,
    sys_title,
    sys_effectiveAcl,
    sys_acl,
};

export const getApplicationConfigProviders = (document: Partial<Document>) => [
    mockHxcsJsClientConfigurationService,
    userApiProvider,
    groupApiProvider,
    documentApiProvider,
    queryApiProvider,
    copyApiProvider,
    moveApiProvider,
    PermissionsPanelRequestService,
    MockProvider(DocumentService, {
        updateDocument: (_id, updatedProperties) => of({ ...document, ...updatedProperties } as Document).pipe(delay(1000)),
    }),
    importProvidersFrom([I18nModule, MatSnackBarModule]),
    provideAnimations(),
    {
        provide: IDENTITY_USER_SERVICE_TOKEN,
        useValue: {
            getCurrentUserInfo: () => ({
                id: '0000-fake-user-uuid-0000',
            }),
        },
    },
    MockProvider(UserPreferencesService, {
        select: () => of('ltr') as any,
    }),
];

export const moduleMetadataProviders = [
    provideTranslations('adf-enterprise-adf-hx-content-services-ui', 'assets/adf-enterprise-adf-hx-content-services-ui'),
    {
        provide: GROUP_API_TOKEN,
        useValue: {
            searchGroups: (textToSearch: string) =>
                firstValueFrom(
                    of({
                        data: [
                            { name: 'Sales', id: 'id-sales' },
                            { name: 'Hr', id: 'id-hr' },
                            { name: 'Repoadmin', id: 'id-repoadmin' },
                        ].filter(({ name }) => textToSearch.length > 0 && name.toLowerCase().includes(textToSearch.toLowerCase())),
                    }).pipe(delay(1000))
                ),
        },
    },
    {
        provide: USER_API_TOKEN,
        useValue: {
            searchUsersByName: (textToSearch: string) =>
                firstValueFrom(
                    of({
                        data: [
                            { firstName: 'Neil', lastName: 'Ross', id: 'id-ross' },
                            { firstName: 'Diana', lastName: 'Young', id: 'id-young' },
                            { firstName: 'Johan', lastName: 'Amadeus', id: 'id-amadeus' },
                            { firstName: 'Sebastian', lastName: 'Wolfgang', id: 'id-wolfgang' },
                        ].filter(({ firstName, lastName }) => {
                            if (textToSearch.length > 0) {
                                const lowerCaseTextToSearch = textToSearch.toLowerCase();
                                return (
                                    firstName.toLowerCase().includes(lowerCaseTextToSearch) || lastName.toLowerCase().includes(lowerCaseTextToSearch)
                                );
                            }
                            return false;
                        }),
                    }).pipe(delay(1000))
                ),
        },
    },
];
