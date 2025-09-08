/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, Input, OnChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { VersionRestoreActionService } from './version-restore-action.service';
import { ActionContext } from '@alfresco/adf-hx-content-services/services';

@Component({
    selector: 'hxp-version-restore',
    standalone: true,
    imports: [MatButtonModule, MatMenuModule, MatIconModule, TranslateModule],
    templateUrl: './version-restore.component.html',
})
export class VersionRestoreComponent implements OnChanges {
    @Input() isAvailable = false;
    @Input() data: ActionContext = { documents: [] };

    private versionRestoreService = Inject(VersionRestoreActionService);

    ngOnChanges(): void {
        this.isAvailable = this.versionRestoreService.isAvailable(this.data);
    }

    protected restoreVersion(): void {
        this.versionRestoreService.execute(this.data);
    }
}
