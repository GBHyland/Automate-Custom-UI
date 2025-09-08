/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { CreateLegalHoldCaseButtonService } from './create-legal-hold-case-button.service';
import { LegalHoldListComponent } from '../../../record-management/dialogs/legal-hold-list/legal-hold-list.component';
import { MatDialogRef } from '@angular/material/dialog';
import { LegalHoldInitiator, LegalHoldInitiatorType } from '../../config/legal-config.type';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'hxp-create-legal-hold-case-button',
    standalone: true,
    templateUrl: './create-legal-hold-case-button.component.html',
    styleUrls: ['./create-legal-hold-case-button.component.scss'],
    imports: [MatButtonModule, TranslatePipe, MatIconModule],
})
export class CreateLegalHoldCaseButtonComponent {
    @Input() clickedFrom!: LegalHoldInitiatorType;

    private createLegalHoldCaseButtonService = inject(CreateLegalHoldCaseButtonService);
    private parentDialogRef = inject(MatDialogRef<LegalHoldListComponent>, { optional: true });

    get isAvailable(): boolean {
        return this.createLegalHoldCaseButtonService.isAvailable();
    }

    createLegalHoldCase() {
        if (this.clickedFrom === LegalHoldInitiator.Record && this.parentDialogRef) {
            this.parentDialogRef.close();
        }

        this.createLegalHoldCaseButtonService.execute(this.clickedFrom);
    }
}
