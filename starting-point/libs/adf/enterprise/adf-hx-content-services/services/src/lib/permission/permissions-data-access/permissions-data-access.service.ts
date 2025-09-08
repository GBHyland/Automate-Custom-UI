/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { ACE } from '@hylandsoftware/hxcs-js-client';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HxpNotificationService } from '../../notification/hxp-notification.service';
import { DocumentService } from '../../document/document.service';
import { UserType } from '../models/user-type.enum';
import { getNotificationMessage } from '../utils/permissions-utils';

@Injectable({
    providedIn: 'root',
})
export class PermissionsDataAccessService {
    constructor(private hxpNotificationService: HxpNotificationService, private documentService: DocumentService) {}

    updateDocument(id: string, acl: ACE[], restoreType?: UserType): Observable<boolean> {
        return this.documentService.updateDocument(id, { sys_acl: acl }).pipe(
            map(() => {
                const message = getNotificationMessage(true, restoreType);
                this.hxpNotificationService.showSuccess(message);
                return true;
            }),
            catchError(() => {
                const message = getNotificationMessage(false, restoreType);
                this.hxpNotificationService.showError(message);
                return of(false);
            })
        );
    }
}
