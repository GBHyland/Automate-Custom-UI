/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
    standalone: true,
    imports: [NgIf, TranslatePipe],
    selector: 'hyland-idp-viewer-empty',
    templateUrl: 'viewer-empty.component.html',
    styleUrls: ['./viewer-empty.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyComponent {}
