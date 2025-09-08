/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'hxp-public-access-shell',
    standalone: true,
    imports: [RouterOutlet],
    template: '<router-outlet/>',
})
export class PublicAccessShellComponent {}
