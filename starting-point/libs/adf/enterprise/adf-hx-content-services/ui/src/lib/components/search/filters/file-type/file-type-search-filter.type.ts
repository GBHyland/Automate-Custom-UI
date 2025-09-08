/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseFilterFormType } from '@alfresco/adf-hx-content-services/services';
import { FileTypeFlatNode } from './tree/file-type-search-filter-file-type-node';

export interface FileTypeSearchFilterFormType extends BaseFilterFormType {
    selectedDocuments: FileTypeFlatNode[];
}
