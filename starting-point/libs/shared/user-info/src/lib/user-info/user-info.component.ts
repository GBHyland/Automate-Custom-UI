/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AuthenticationService, IdentityUserInfoComponent, IdentityUserModel } from '@alfresco/adf-core';
import { Component, Input, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { IdentityUserService } from '@alfresco-dbp/shared/identity';

@Component({
    selector: 'hxp-app-user-info',
    standalone: true,
    templateUrl: './user-info.component.html',
    imports: [CommonModule, AsyncPipe, IdentityUserInfoComponent],
})
export class UserInfoComponent implements OnInit {
    @Input() showName = true;

    identityUser?: IdentityUserModel;

    get isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    constructor(private identityUserService: IdentityUserService, private authService: AuthenticationService) {}

    ngOnInit() {
        this.getUserInfo();
    }

    getUserInfo() {
        if (this.authService.isOauth()) {
            this.loadIdentityUserInfo();
        }
    }

    private loadIdentityUserInfo() {
        this.identityUser = this.identityUserService.getCurrentUserInfo();
    }
}
