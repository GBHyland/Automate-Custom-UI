/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionContext } from '../../context-menu-actions/actions/action-context.interface';
import { hasPermission, isVersionable } from '../../document/configs/document.utils';
import { DocumentActionService } from '../../context-menu-actions/actions/document-action.service';
import { DocumentPermissions } from '../../document/configs/document-permissions.enum';

@Injectable({
    providedIn: 'root',
})
export class ManageVersionsButtonActionService extends DocumentActionService {
    showVersionsPanel$: Observable<boolean>;
    private showVersionsPanelSubject = new BehaviorSubject<boolean>(false);

    constructor() {
        super();
        this.showVersionsPanel$ = this.showVersionsPanelSubject.asObservable();
    }

    public isAvailable(context: ActionContext): boolean {
        return (
            context.documents?.length === 1 &&
            isVersionable(context.documents[0]) &&
            hasPermission(context.documents[0], DocumentPermissions.READ_VERSION)
        );
    }

    public execute(context: ActionContext): void {
        this.showVersionsPanelSubject.next(context?.showPanel === 'version');
    }
}
