/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { IdentityUserModel, PeopleCloudComponent } from '@alfresco/adf-process-services-cloud';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
    selector: 'hxp-user-filter-menu',
    standalone: true,
    imports: [CommonModule, MatDividerModule, MatButtonModule, TranslatePipe, A11yModule, PeopleCloudComponent],
    templateUrl: './user-filter-menu.component.html',
    styleUrls: ['./user-filter-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFilterMenuComponent {
    @Input() selectedUsers: IdentityUserModel[] = [];
    @Input() appName = '';

    @Output() update: EventEmitter<IdentityUserModel[]> = new EventEmitter<IdentityUserModel[]>();

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.onUpdate();
        }
    }

    onUpdate(): void {
        this.update.emit(this.selectedUsers);
    }

    onUsersChanged(users: IdentityUserModel[]): void {
        this.selectedUsers = users;
    }
}
