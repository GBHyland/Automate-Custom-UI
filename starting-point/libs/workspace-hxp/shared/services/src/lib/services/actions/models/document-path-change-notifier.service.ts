/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Directive } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DocumentPathChange } from './document-path-change.model';

@Directive()
export abstract class DocumentPathChangeNotifierService {
    readonly documentPathChange$: Observable<DocumentPathChange>;
    private readonly documentPathChangesSubject = new Subject<DocumentPathChange>();

    constructor() {
        this.documentPathChange$ = this.documentPathChangesSubject.asObservable();
    }

    protected emitDocumentPathChange(pathChange: DocumentPathChange): void {
        this.documentPathChangesSubject.next(pathChange);
    }
}
