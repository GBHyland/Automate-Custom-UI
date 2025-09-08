/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdentityUserModel } from '@alfresco/adf-process-services-cloud';
import { Filter, FilterType } from '../filter.model';
import { isEqual } from 'es-toolkit/compat';

export interface UserFilterConfig {
    name: string;
    translationKey: string;
    value: IdentityUserModel[] | null;
    appName: string;
    allowEmpty?: boolean;
    visible: boolean;
}

export class UserFilter implements Filter<IdentityUserModel[]> {
    readonly type = FilterType.USER;

    name = '';
    translationKey = '';
    label = '';
    value: IdentityUserModel[] | null = null;
    appName = '';
    allowEmpty = true;
    visible = false;

    constructor(config: UserFilterConfig) {
        this.name = config.name;
        this.translationKey = config.translationKey;
        this.value = config.value;
        this.allowEmpty = config.allowEmpty ?? true;
        this.visible = config.visible;
        this.appName = config.appName;
    }

    isValueEqualTo(other: UserFilter): boolean {
        const isCurrentValueEmpty = this.value === null || this.value.length === 0;
        const isOtherValueEmpty = other.value === null || other.value.length === 0;
        const areBothValuesEmpty = isCurrentValueEmpty && isOtherValueEmpty;

        return areBothValuesEmpty || isEqual(this.value, other.value);
    }
}
