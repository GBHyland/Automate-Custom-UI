/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AsyncPipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { User } from '@hylandsoftware/hxcs-js-client';
import { UserResolverService } from '../user/user-resolver.service';

/**
 * A pipe that resolves the user data into a string representation of user names.
 * The user data can be a string representing a User id, a User object, an array of User ids or User objects, or undefined.
 *
 * @remarks
 * Developers using this pipe need to configure/provide the `userApiProvider` provider somewhere.
 *
 * @param userData - The user data to transform. It can be a string representing a User id, a User object, an array of User ids or User objects, or undefined.
 * @returns An Observable that emits a string representation of user names.
 *
 * @example
 * Users is a mixed array of User ids and User Objects:
 * ```typescript
 * users = ['user-id-1', 'user-id-2', { id: 'user-id-3', firstName: 'John', lastName: 'Doe' }];
 * ```
 * Pipe usage:
 * ```html
 * <div>{{ users | hxpUserResolverPipe }}</div>
 * ```
 */
@Pipe({
    name: 'hxpUserResolverPipe',
    pure: false,
    standalone: true,
})
export class UserResolverPipe implements PipeTransform {
    private asyncPipe = inject(AsyncPipe);

    constructor(private userResolverService: UserResolverService) {}

    transform(userData: string | User | Array<string | User> | undefined): string {
        if (!userData) {
            return '';
        }
        const userDataArray = Array.isArray(userData) ? userData : [userData];
        return this.asyncPipe.transform(this.userResolverService.parse(userDataArray)) || '';
    }
}
