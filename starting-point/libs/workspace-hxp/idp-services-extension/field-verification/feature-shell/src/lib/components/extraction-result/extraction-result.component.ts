/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { IdpField } from '../../models/screen-models';
import { IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';

@Component({
    selector: 'hyland-idp-extraction-result',
    templateUrl: './extraction-result.component.html',
    styleUrls: ['./extraction-result.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatIconModule, TranslatePipe],
})
export class ExtractionResultComponent {
    @Input()
    set field(value: IdpField) {
        this.hasIssue = value?.hasIssue ?? true;
        if (this.hasIssue) {
            this.status = 'EXTRACTION.VERIFICATION.EXTRACTION_RESULT.EXTRACTION_ISSUE';
            return;
        }

        switch (value?.verificationStatus) {
            case IdpVerificationStatus.AutoValid: {
                this.status = 'EXTRACTION.VERIFICATION.EXTRACTION_RESULT.EXTRACTED_SUCCESSFULLY';
                break;
            }
            case IdpVerificationStatus.ManualValid: {
                this.status = 'EXTRACTION.VERIFICATION.EXTRACTION_RESULT.VERIFIED';
                break;
            }
            default: {
                this.status = 'EXTRACTION.VERIFICATION.EXTRACTION_RESULT.NOT_VERIFIED';
                this.hasIssue = true;
                break;
            }
        }
    }

    constructor() {}

    status = '';
    hasIssue = false;
}
