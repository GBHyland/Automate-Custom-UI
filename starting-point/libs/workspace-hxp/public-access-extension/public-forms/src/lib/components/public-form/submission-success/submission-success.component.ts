/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component } from '@angular/core';
import { EmptyContentComponent } from '@alfresco/adf-core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'hxp-submission-success',
    standalone: true,
    imports: [EmptyContentComponent, TranslatePipe],
    template: `
        <adf-empty-content icon="check_circle"
          style="height: 100vh"
          [title]="'APP.PUBLIC_FORM.SUCCESS.SCREEN.TITLE' | translate"
          [subtitle]="'APP.PUBLIC_FORM.SUCCESS.SCREEN.SUBTITLE' | translate" />
    `,
})
export class SubmissionSuccessComponent {}
