/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { IdentityGroupModel } from '../models/identity-group.model';

@Pipe({
    name: 'groupNameInitial',
    standalone: true,
})
export class InitialGroupNamePipe implements PipeTransform {
    transform(group: IdentityGroupModel): string {
        let result = '';
        if (group) {
            result = this.getInitialGroupName(group.name).toUpperCase();
        }
        return result;
    }

    getInitialGroupName(groupName: string) {
        groupName = groupName ? groupName[0] : '';
        return groupName;
    }
}
