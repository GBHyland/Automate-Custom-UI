/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { User } from '@hylandsoftware/hxcs-js-client';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class UserResolverService {
    constructor(private userService: UserService) {}

    // Note: since some user related fields are already resolved, we need to support them here.
    parse(userData?: Array<string | User>): Observable<string> {
        if (!userData || userData.length === 0) {
            return of('');
        }
        const users$ = userData.map((data) => (typeof data === 'string' ? this.resolveUser(data) : this.getFullName(data)));
        return combineLatest(users$).pipe(map((userNames) => userNames.join(',')));
    }

    private resolveUser(id: string): Observable<string> {
        return this.userService.resolveUser(id).pipe(switchMap((user) => this.getFullName(user)));
    }

    private getFullName(user: User): Observable<string> {
        return of(`${user.firstName} ${user.lastName}`);
    }
}
