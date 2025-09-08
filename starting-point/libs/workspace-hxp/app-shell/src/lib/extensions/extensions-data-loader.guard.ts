/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { EXTENSION_DATA_LOADERS_TOKEN } from '@alfresco-dbp/workspace-hxp/process-services-cloud-extension/process-form/feature-shell';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export type ExtensionLoaderCallback = (route: ActivatedRouteSnapshot) => Observable<boolean>;

export const DefaultExtensionLoaderFactory = () => [];

export const ExtensionsDataLoaderGuard: CanActivateFn = (route: ActivatedRouteSnapshot): Observable<boolean> => {
    const extensionDataLoaders = inject(EXTENSION_DATA_LOADERS_TOKEN);
    if (extensionDataLoaders.length === 0) {
        return of(true);
    }

    const dataLoaderCallbacks = extensionDataLoaders.map((callback) => callback(route));

    return forkJoin(dataLoaderCallbacks).pipe(
        map(() => true),
        catchError((e) => {
            // eslint-disable-next-line no-console
            console.error('Some of the extension data loader guards has been errored.');
            // eslint-disable-next-line no-console
            console.error(e);
            return of(true);
        })
    );
};
