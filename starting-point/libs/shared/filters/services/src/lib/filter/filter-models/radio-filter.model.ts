/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Filter, FilterType, Option } from '../filter.model';

export interface RadioFilterConfig {
    name: string;
    translationKey: string;
    description?: string;
    value: Option | null;
    options: Option[];
    allowEmpty?: boolean;
    visible: boolean;
}

export class RadioFilter implements Filter<Option> {
    readonly type = FilterType.RADIO;

    name = '';
    translationKey = '';
    description?: string;
    label = '';
    value: Option | null = null;
    options: Option[] = [];
    allowEmpty = true;
    visible = false;

    constructor(config: RadioFilterConfig) {
        this.name = config.name;
        this.translationKey = config.translationKey;
        this.value = config.value;
        this.options = config.options;
        this.allowEmpty = config.allowEmpty ?? true;
        this.visible = config.visible;
        this.description = config.description;
    }

    isValueEqualTo(other: RadioFilter): boolean {
        return this.value?.value === other.value?.value;
    }
}
