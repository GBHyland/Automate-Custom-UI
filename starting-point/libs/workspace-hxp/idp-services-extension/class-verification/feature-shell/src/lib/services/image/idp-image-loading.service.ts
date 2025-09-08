/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable, of, switchMap, take, tap, withLatestFrom } from 'rxjs';
import { ClassVerificationRootState } from '../../store/states/root.state';
import { Store } from '@ngrx/store';
import { selectPageById } from '../../store/selectors/document.selectors';
import { selectCorrelationId } from '../../store/selectors/screen.selectors';
import { IdpImageInfo, IdpSharedImageLoadingService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { userActions } from '../../store/actions/class-verification.actions';

@Injectable()
export class IdpImageLoadingService {
    constructor(
        private readonly store: Store<ClassVerificationRootState>,
        private readonly sharedImageLoadingService: IdpSharedImageLoadingService
    ) {}

    getImageDataForPage$(pageId: string, thumbnail = false): Observable<IdpImageInfo | undefined> {
        return this.store.select(selectPageById(pageId)).pipe(
            take(1),
            withLatestFrom(this.store.select(selectCorrelationId)),
            switchMap(([page, correlationId]) => {
                if (!page) {
                    // eslint-disable-next-line unicorn/no-useless-undefined
                    return of(undefined);
                }
                return this.sharedImageLoadingService.getImageDataForPage$(page, correlationId, thumbnail).pipe(
                    tap((imageInfo) => {
                        if (imageInfo) {
                            this.store.dispatch(
                                userActions.updatePagesRotation({
                                    pages: [
                                        {
                                            pageId,
                                            documentId: page.documentId,
                                            viewerRotation: imageInfo.viewerRotation,
                                            rotation: imageInfo.correctionAngle,
                                        },
                                    ],
                                    taskDataSynced: undefined,
                                })
                            );
                        }
                    })
                );
            })
        );
    }

    cleanup(): void {
        this.sharedImageLoadingService.cleanup();
    }
}
