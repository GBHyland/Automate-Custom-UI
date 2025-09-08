/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { User, UserApi } from '@hylandsoftware/hxcs-js-client';
import { Observable, from } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Inject, Injectable } from '@angular/core';
import { USER_API_TOKEN } from '@alfresco/adf-hx-content-services/api';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    protected cache: Map<string, Observable<User>> = new Map();

    constructor(@Inject(USER_API_TOKEN) private userApi: UserApi) {}

    resolveUser(id: string): Observable<User> {
        if (this.cache.has(id)) {
            return this.cache.get(id) as Observable<User>;
        }
        const user$ = from(this.userApi.getUserById(id)).pipe(
            map((res) => {
                return res.data;
            }),
            shareReplay(1)
        );
        this.cache.set(id, user$);
        return user$;
    }
}
