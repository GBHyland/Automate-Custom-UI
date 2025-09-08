/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { uploadApiProvider } from '@alfresco/adf-hx-content-services/api';

@NgModule({
    providers: [uploadApiProvider],
})
export class HxpUploadModule {}
