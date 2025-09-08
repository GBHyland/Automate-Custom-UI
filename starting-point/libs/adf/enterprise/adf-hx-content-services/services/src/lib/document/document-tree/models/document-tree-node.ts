/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Document } from '@hylandsoftware/hxcs-js-client';
import { Subject } from 'rxjs';

export class DocumentTreeNode {
    constructor(
        public document: Document,
        public level: number = 1,
        public isExpandable: boolean = false,
        public isLoading: boolean = false,
        public isSelectable: boolean = true,
        public isSkeleton = false,
        public totalCount: number = 0,
        public nodeLoaded: Subject<boolean> = new Subject(),
        public loadCancel$: Subject<void> = new Subject<void>()
    ) {}
}
