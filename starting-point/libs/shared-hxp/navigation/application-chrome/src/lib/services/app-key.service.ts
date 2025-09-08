/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { JwtHelperService } from '@alfresco/adf-core';
import { inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AppKeyService {
    private readonly jwtHelperService = inject(JwtHelperService);

    public currentKey: string;

    constructor() {
        this.currentKey = this.getCurrentAppKey();
    }

    private getCurrentAppKey(): string {
        return this.jwtHelperService.getValueFromLocalToken<{ appkey: string }>(JwtHelperService.HXP_AUTHORIZATION)?.appkey ?? '';
    }
}
