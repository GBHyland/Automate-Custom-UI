/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { ActionContext, GovernanceRecord } from '../../../mocks/record.type';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RecordPropertiesButtonService {
    private showSidebarSubject = new BehaviorSubject<boolean>(false);
    showSidebar$: Observable<boolean> = this.showSidebarSubject.asObservable();

    isAvailable(records: GovernanceRecord[]): boolean {
        return records.length === 1;
    }

    execute(actionContext: ActionContext): void {
        this.showSidebarSubject.next(actionContext?.showPanel ?? false);
    }
}
