/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, throwError, Observable, ReplaySubject, takeUntil, finalize } from 'rxjs';
import { IdpBackendService, IdpFileMetadata } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { ImportingDocument } from '../../store/states/importing-document.state';
import { Store } from '@ngrx/store';
import { systemActions } from '../../store/actions/class-verification.actions';

@Injectable()
export class IdpDocumentMetadataService {
    public readonly documentMetadataExtractionSuccess$ = new BehaviorSubject<ImportingDocument | undefined>(undefined);
    public readonly documentMetadataExtractionError$ = new BehaviorSubject<ImportingDocument | undefined>(undefined);
    public readonly documentMetadataExtractionCancelled$ = new BehaviorSubject<ImportingDocument | undefined>(undefined);

    private readonly cancelExtractMap = new Map<string, ReplaySubject<void>>();
    private readonly idpService = inject(IdpBackendService);
    private readonly store = inject(Store);

    public extractDocumentMetadata$(document: ImportingDocument, correlationId: string): Observable<IdpFileMetadata> {
        if (!document.sysId) {
            throw new Error('sysId is required');
        }

        let cancel$ = this.cancelExtractMap.get(document.id);
        if (cancel$) {
            cancel$.next();
        } else {
            cancel$ = new ReplaySubject<void>(1);
            this.cancelExtractMap.set(document.id, cancel$);
        }

        return this.idpService.extractDocumentMetadata$(correlationId, document.sysId).pipe(
            map((res) => {
                this.documentMetadataExtractionSuccess$.next(document);
                return res;
            }),
            catchError((err) => {
                this.documentMetadataExtractionError$.next(document);
                return throwError(() => err);
            }),
            finalize(() => {
                if (document.sysId) {
                    this.cancelExtractMap.delete(document.id);
                }
            }),
            takeUntil(cancel$)
        );
    }

    public cancelExtractDocumentMetadata(document: ImportingDocument) {
        this.documentMetadataExtractionCancelled$.next(document);
        let cancel$ = this.cancelExtractMap.get(document.id);
        if (cancel$) {
            cancel$.next();
            this.cancelExtractMap.delete(document.id);
        } else {
            cancel$ = new ReplaySubject<void>(1);
            this.cancelExtractMap.set(document.id, cancel$);
        }
        this.store.dispatch(
            systemActions.uploadedDocumentReceivedMetadataCancelled({
                documentIds: [document.id],
            })
        );
    }
}
