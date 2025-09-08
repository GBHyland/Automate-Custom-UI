/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FieldType } from '@alfresco/adf-hx-content-services/api';
import { TemplateRef } from '@angular/core';

export interface ColumnConfig {
    key: string;
    title: string;
    sortable: boolean;
    removable: boolean;
    type?: FieldType;
    templateRef?: TemplateRef<unknown>;
}
