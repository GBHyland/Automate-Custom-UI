/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/*
 * Best practices to avoid circular dependency:
 * every provider and token pair should be created in a separate file
 * inside the providers folder of this lib
 * and add exports in the entry-point lib (index.ts)
 * then you can import the provider in any module from the shared folder
 */

import { Configuration } from '@hylandsoftware/hxcs-js-client';
import { AppConfigService, AppConfigValues, AuthenticationService } from '@alfresco/adf-core';
import { FactoryProvider, InjectionToken } from '@angular/core';
import { BaseAPI } from '@hylandsoftware/hxcs-js-client/typings/base';
import { share } from 'rxjs/operators';

type IHxcsJsClientApiClass<T extends BaseAPI> = new (configuration?: Configuration, basePath?: string) => T;

function getHxcsJsClientApiFactoryFunction<T extends BaseAPI>(apiClass: IHxcsJsClientApiClass<T>) {
    const hxcsSdkJsApiFactoryFn = (authService: AuthenticationService, configService: AppConfigService) => {
        if (configService.status !== 'loaded') {
            throw new Error('[hxcsSdkJsApiFactoryFn]: Configuration not available to initialize provider');
        }
        const config = new Configuration({
            basePath: configService.get(AppConfigValues.ECMHOST),
            accessToken: authService.getToken(),
        });
        return getRefreshingTokenApi<T>(apiClass, authService, config);
    };
    return hxcsSdkJsApiFactoryFn;
}

export function getHxcsJsClientProvider<T extends BaseAPI>(tokenName: string, apiClass: IHxcsJsClientApiClass<T>): FactoryProvider {
    const injectionToken = new InjectionToken<T>(tokenName);
    return {
        provide: injectionToken,
        useFactory: getHxcsJsClientApiFactoryFunction<T>(apiClass),
        deps: [AuthenticationService, AppConfigService],
    };
}

function getRefreshingTokenApi<T extends BaseAPI>(apiClass: IHxcsJsClientApiClass<T>, authService: AuthenticationService, config: Configuration) {
    const instance = new apiClass(config) as any;
    authService.onTokenReceived.pipe(share()).subscribe(() => {
        instance.configuration.accessToken = authService.getToken();
    });
    return instance as T;
}
