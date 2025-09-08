/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Document } from '@hylandsoftware/hxcs-js-client';
import { Observable, Subject } from 'rxjs';

export enum SelectionMode {
    single = 'single',
    multiple = 'multiple',
}

export interface AttachFileDialogData {
    defaultDocumentPath$: Observable<string | undefined>;
    selectionMode: SelectionMode;
    selectionSubject$: Subject<Document[]>;
    isLocalUploadAvailable: boolean;
    isContentUploadAvailable: boolean;
}
