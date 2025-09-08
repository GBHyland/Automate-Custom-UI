/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActionContext } from '../../../mocks/record.type';
import { AddLegalHoldButtonService } from './add-legal-hold-button.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { GovernanceLegalHoldManagementService } from '../../../legal-hold-management/services/governance-legal-hold-management.service';
@Component({
    selector: 'hxp-add-legal-hold-button',
    standalone: true,
    templateUrl: './add-legal-hold-button.component.html',
    imports: [MatIconModule, MatButtonModule, TranslatePipe, MatTooltipModule, AsyncPipe],
})
export class AddLegalHoldButtonComponent implements OnInit, OnDestroy {
    @Input() actionContext!: ActionContext;

    private governanceLegalHoldManagementService = inject(GovernanceLegalHoldManagementService);
    private addLegalHoldButtonService = inject(AddLegalHoldButtonService);
    private onDestroy$ = new Subject<void>();

    get isAvailable$(): Observable<boolean> {
        return this.addLegalHoldButtonService.isAvailable(this.actionContext.records);
    }

    ngOnInit(): void {
        this.governanceLegalHoldManagementService.shouldRefreshList$.pipe(takeUntil(this.onDestroy$)).subscribe((shouldRefresh: boolean) => {
            if (shouldRefresh) {
                this.addLegalHoldButtonService.execute(this.actionContext);
            }
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    openLegalHoldDialog(): void {
        this.addLegalHoldButtonService.execute(this.actionContext);
    }
}
