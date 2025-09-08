/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserFilter } from '@alfresco-dbp/shared-filters-services';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FilterComponent } from '../filter.component';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FullNamePipe } from '@alfresco/adf-core';
import { FilterChipComponent } from '../../filter-chip/filter-chip.component';
import { UserFilterMenuComponent } from './user-filter-menu/user-filter-menu.component';
import { IdentityUserModel } from '@alfresco/adf-process-services-cloud';
import { FilterMenuOverlayDirective } from '../../filter-menu/filter-menu-overlay.directive';

@Component({
    selector: 'hxp-user-filter',
    templateUrl: './user-filter.component.html',
    standalone: true,
    imports: [CommonModule, OverlayModule, FilterMenuOverlayDirective, UserFilterMenuComponent, FilterChipComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFilterComponent extends FilterComponent<UserFilter> implements OnInit {
    labelSuffix: { label: string; count: number } | null = null;

    ngOnInit(): void {
        if (!this.filter) {
            return;
        }

        this.updateSuffix();
    }

    onUpdate(value: IdentityUserModel[]): void {
        if (this.filter) {
            this.filter.value = value && value.length > 0 ? value : null;
            this.updateSuffix();
            this.filterChange.emit(this.filter);
            this.isMenuOpen = false;
        }
    }

    private updateSuffix(): void {
        if (!this.filter) {
            return;
        }

        const fullNamePipe = new FullNamePipe();

        this.labelSuffix = this.filter.value?.length
            ? {
                  label: fullNamePipe.transform(this.filter.value[0]),
                  count: this.filter.value.length,
              }
            : null;
    }
}
