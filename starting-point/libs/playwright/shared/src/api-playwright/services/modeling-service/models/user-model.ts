/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserRepresentation } from '@alfresco/js-api';
import { UtilRandom } from '../../../../utils';

export class UserModel {
    firstName?: string = UtilRandom.generateAlphaLowerCase(7);
    lastName?: string = UtilRandom.generateAlphaLowerCase(7);
    password?: string = UtilRandom.generateAlphaNumeric(10);
    email?: string;
    username?: string;
    idIdentityService?: string;
    type = 'enterprise';
    tenantId?: number;
    company?: string;
    id: number;

    constructor(details: any = {}) {
        const EMAIL_DOMAIN = 'alfresco.com';
        this.firstName = details.firstName ?? this.firstName;
        this.lastName = details.lastName ?? this.lastName;

        const USER_IDENTIFY = `${this.firstName}${this.lastName}.${UtilRandom.generateAlphaNumeric(5)}`;

        this.password = details.password ?? this.password;
        this.email = details.email ?? `${USER_IDENTIFY}@${EMAIL_DOMAIN}`;
        this.username = details.username ?? USER_IDENTIFY;
        this.idIdentityService = details.idIdentityService ?? this.idIdentityService;
        this.type = details.type ?? this.type;
        this.tenantId = details.tenantId ?? this.tenantId;
        this.company = details.company ?? this.company;
        this.id = details.id ?? this.id;
    }

    get fullName() {
        return `${this.firstName ?? ''} ${this.lastName ?? ''}`;
    }

    getAPSModel() {
        return new UserRepresentation({
            firstName: this.firstName,
            lastName: this.lastName,
            password: this.password,
            email: this.email,
            type: this.type,
            tenantId: this.tenantId,
            company: this.company,
            id: this.id,
        });
    }
}
