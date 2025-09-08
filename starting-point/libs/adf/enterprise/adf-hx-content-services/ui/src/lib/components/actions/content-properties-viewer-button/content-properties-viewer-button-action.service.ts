/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionContext, DocumentActionService, DocumentPermissions, hasPermission } from '@alfresco/adf-hx-content-services/services';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ContentPropertyViewerActionService extends DocumentActionService {
    showPropertyPanel$: Observable<boolean>;
    private showPropertyPanelSubject = new BehaviorSubject<boolean>(false);

    constructor() {
        super();
        this.showPropertyPanel$ = this.showPropertyPanelSubject.asObservable();
    }

    isAvailable(context: ActionContext): boolean {
        return context.documents?.length === 1 && hasPermission(context.documents[0], DocumentPermissions.READ);
    }

    execute(context: ActionContext): void {
        this.showPropertyPanelSubject.next(context?.showPanel === 'property');
    }
}
