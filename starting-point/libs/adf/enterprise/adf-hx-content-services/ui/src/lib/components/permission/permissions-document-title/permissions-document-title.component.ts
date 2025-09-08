/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'hxp-permissions-document-title',
    templateUrl: './permissions-document-title.component.html',
    styleUrls: ['./permissions-document-title.component.scss'],
    standalone: true,
    imports: [MatDialogModule, TranslatePipe],
})
export class PermissionsDocumentTitleComponent {
    @Input() title = '';
}
