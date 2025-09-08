/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpConfigClass, SYS_DOCUMENT_CLASS_REJECTED, SYS_DOCUMENT_CLASS_UNCLASSIFIED } from '../screen-models';

export function mockIdpConfigClasses(): IdpConfigClass[] {
    return [
        {
            ...SYS_DOCUMENT_CLASS_REJECTED,
            isExpanded: false,
            isSelected: false,
            isPreviewed: false,
        },
        {
            ...SYS_DOCUMENT_CLASS_UNCLASSIFIED,
            isExpanded: false,
            isSelected: false,
            isPreviewed: false,
        },
        {
            id: 'payslips',
            name: 'Payslips',
            isSpecialClass: false,
            isExpanded: false,
            isSelected: false,
            isPreviewed: false,
        },
        {
            id: 'employment-contract',
            name: 'Employment Contract',
            isSpecialClass: false,
            isExpanded: false,
            isSelected: false,
            isPreviewed: false,
        },
    ];
}
