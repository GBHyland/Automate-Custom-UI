/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Document } from '@hylandsoftware/hxcs-js-client';

export type FormAttachWidgetDialogServiceConfig = MatDialogConfig & {
    selectionSubject$: Subject<Document[]>;
};

@Injectable()
export abstract class SharedAttachFileDialogService {
    abstract openDialog(config: FormAttachWidgetDialogServiceConfig): void;
    abstract closeDialog(): void;
    abstract downloadDocuments(documents: Document[]): void;
}
