/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AppConfigService, AuthenticationService } from '@alfresco/adf-core';
import { switchMap, take } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

/* eslint-disable prefer-const */

const sanitizePaths = ['search'];

// This function is used to calculate the SHA-256 hash of a given message.
async function calculateSHA256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = [...new Uint8Array(hashBuffer)];
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

@Injectable({
    providedIn: 'root',
})
export class PendoService {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly appConfigService: AppConfigService,
        @Inject(DOCUMENT) private readonly document: Document
    ) {}

    init() {
        this.appConfigService
            .select('analytics')
            .pipe(
                switchMap((pendoEnabled) => {
                    const isPendoEnabled = this.isPendoEnabled(pendoEnabled);
                    if (isPendoEnabled) {
                        this.injectPendoJS();
                    }
                    return forkJoin({
                        loginPipe: this.authenticationService.onLogin.pipe(take(1)),
                        isPendoEnabled: of(isPendoEnabled),
                    });
                })
            )
            .subscribe(async (login) => {
                if (login.isPendoEnabled) {
                    const username = this.authenticationService.getUsername();
                    const userId = await this.hashUserName(username);
                    const accountId = this.getAccountId();
                    const window = this.document.defaultView as any;
                    const pendo = window?.pendo;

                    if (window && pendo) {
                        pendo.initialize({
                            sanitizeUrl: (url: string) => this.sanitize(url, sanitizePaths),

                            visitor: {
                                id: userId,
                            },
                            account: {
                                id: accountId,
                                host: window.location.hostname,
                            },
                            disableGuides: this.disableGuides,
                            excludeAllText: this.excludeAllText,
                        });
                    }
                }
            });
    }

    private get disableGuides(): boolean {
        return this.appConfigService.get<string>('analytics.pendo.disableGuides') === 'true';
    }

    private get excludeAllText(): boolean {
        return this.appConfigService.get<string>('analytics.pendo.excludeAllText') === 'true';
    }

    getAccountId() {
        const titleAppKebabCase = this.appConfigService.get<string>('application.name')?.replace(/\s+/g, '-').toLowerCase();

        const customerName = this.appConfigService.get<boolean>('customer.name');
        return customerName || titleAppKebabCase;
    }

    isPendoEnabled(pendoEnabled: any) {
        return pendoEnabled?.pendo?.enabled === 'true';
    }

    sanitize(url: string, paths: string[]): string {
        let sanitizeUrl = url;
        const index = url.indexOf('?');
        if (index > -1) {
            sanitizeUrl = url.slice(0, index);
        }
        for (const searchKey of paths) {
            const searchIndex = url.indexOf(searchKey);
            if (searchIndex > -1) {
                sanitizeUrl = url.slice(0, searchIndex + searchKey.length);
            }
        }
        return sanitizeUrl;
    }

    injectPendoJS() {
        const window = this.document.defaultView as any;
        const analyticsKey = this.appConfigService.get<string>('analytics.pendo.key');

        ((apiKey: string) => {
            (function (p, e, o) {
                let v: string[], w, x, y, z;
                o = p['pendo'] = p['pendo'] || {};
                o._q = o._q || [];
                v = ['initialize', 'identify', 'updateOptions', 'pageLoad', 'track'];
                for (w = 0, x = v.length; w < x; ++w) {
                    (function (m) {
                        o[m] =
                            o[m] ||
                            function () {
                                // eslint-disable-next-line prefer-rest-params
                                o._q[m === v[0] ? 'unshift' : 'push']([m].concat([].slice.call(arguments, 0)));
                            };
                    })(v[w]);
                }
                y = e.createElement('script');
                y.async = !0;
                y.src = 'https://cdn.pendo.io/agent/static/' + apiKey + '/pendo.js';
                z = e.getElementsByTagName('script')[0];
                z.parentNode?.insertBefore(y, z);
            })(window, document, window.pendo);
        }).bind(this)(analyticsKey);
    }

    async hashUserName(username: string): Promise<string> {
        return calculateSHA256(username);
    }
}
