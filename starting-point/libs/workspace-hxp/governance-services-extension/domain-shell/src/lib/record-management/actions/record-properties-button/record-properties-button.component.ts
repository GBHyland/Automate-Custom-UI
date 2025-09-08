/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, Input } from '@angular/core';
import { ActionContext } from '../../../mocks/record.type';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecordPropertiesButtonService } from './record-properties-button.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'hxp-record-properties-button',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, TranslatePipe, MatTooltipModule],
    templateUrl: './record-properties-button.component.html',
})
export class RecordPropertiesButtonComponent {
    @Input() actionContext: ActionContext = { records: [], showPanel: false };

    private recordPropertiesButtonService = inject(RecordPropertiesButtonService);

    get isAvailable(): boolean {
        return this.recordPropertiesButtonService.isAvailable(this.actionContext.records);
    }

    get isPanelOpen(): boolean {
        return !!this.actionContext.showPanel;
    }

    protected togglePane(): void {
        this.recordPropertiesButtonService.execute({ ...this.actionContext, showPanel: !this.isPanelOpen });
    }
}
