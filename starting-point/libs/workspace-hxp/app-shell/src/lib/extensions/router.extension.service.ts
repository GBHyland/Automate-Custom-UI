/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, Type } from '@angular/core';
import { ExtensionService } from '@alfresco/adf-extensions';
import { Route, Router } from '@angular/router';

export interface ExtensionRoute extends Route {
    parentRoute?: string;
}

@Injectable({
    providedIn: 'root',
})
export class RouterExtensionsService {
    defaults = {
        layout: 'app.layout.main',
        auth: ['app.auth'],
    };

    constructor(private router: Router, protected extensions: ExtensionService) {}

    mapExtensionRoutes() {
        const routesWithoutParent = [];
        this.getApplicationRoutes().forEach((extensionRoute: ExtensionRoute) => {
            if (this.extensionRouteHasChild(extensionRoute)) {
                const parentRoute = this.findRoute(extensionRoute.parentRoute);
                if (parentRoute) {
                    this.convertExtensionRouteToRoute(extensionRoute);
                    parentRoute.children.unshift(extensionRoute);
                }
            } else {
                routesWithoutParent.push(extensionRoute);
            }
        });

        this.router.config.unshift(...routesWithoutParent);
    }

    private getApplicationRoutes(): Array<ExtensionRoute> {
        return this.extensions.routes.map((route) => {
            const guards = this.extensions.getAuthGuards(route.auth && route.auth.length > 0 ? route.auth : this.defaults.auth);

            return {
                path: route.path,
                component: this.getComponentById(route.layout ?? this.defaults.layout),
                canActivateChild: guards,
                canActivate: guards,
                parentRoute: route.parentRoute,
                redirectTo: route['redirectTo'],
                children: [
                    ...(route['children']
                        ? route['children'].map(({ path, component, outlet, data, redirectTo, auth }) => ({
                              path,
                              outlet,
                              data,
                              redirectTo,
                              canActivate: this.extensions.getAuthGuards(auth),
                              component: this.getComponentById(component),
                          }))
                        : []),
                    {
                        path: '',
                        component: this.getComponentById(route.component),
                        data: route.data,
                    },
                ],
            };
        });
    }

    private getComponentById(id: string): Type<unknown> {
        return this.extensions.getComponentById(id);
    }

    private extensionRouteHasChild(route: ExtensionRoute): boolean {
        return route.parentRoute !== undefined;
    }

    private convertExtensionRouteToRoute(extensionRoute: ExtensionRoute) {
        delete extensionRoute.parentRoute;
        delete extensionRoute.component;
    }

    private findRoute(parentRoute) {
        const routeIndex = this.router.config.findIndex((route) => route.path === parentRoute);

        return this.router.config[routeIndex];
    }
}
