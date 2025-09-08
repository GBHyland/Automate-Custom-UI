/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdentityUserModel, IdentityUserService } from '@alfresco-dbp/shared/identity';
import { AuthenticationService, IdentityUserInfoModule, InitialUsernamePipe } from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, Subject, of } from 'rxjs';

@Component({
    standalone: true,
    selector: 'hxp-user-initials',
    templateUrl: './user-initials.component.html',
    styleUrls: ['./user-initials.component.scss'],
    imports: [CommonModule, InitialUsernamePipe, IdentityUserInfoModule, MatTooltipModule],
})
export class UserInitialsComponent implements OnInit {
    identityUser$: Observable<IdentityUserModel> = new Subject<IdentityUserModel>();

    constructor(private readonly identityUserService: IdentityUserService, private readonly authService: AuthenticationService) {}

    ngOnInit() {
        this.getUserInfo();
    }

    private getUserInfo(): void {
        if (this.authService.isOauth()) {
            this.loadIdentityUserInfo();
        }
    }

    private loadIdentityUserInfo(): void {
        const userInfo = this.identityUserService.getCurrentUserInfo();

        this.identityUser$ = of(userInfo);
    }
}
