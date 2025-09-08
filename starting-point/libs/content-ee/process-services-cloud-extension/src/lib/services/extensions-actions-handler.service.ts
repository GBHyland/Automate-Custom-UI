/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExtensionService } from '@alfresco/adf-extensions';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

@Injectable({ providedIn: 'root' })
export class ExtensionActionsHandler {
    constructor(private extensionService: ExtensionService, private store: Store) {}

    runActionById(id: string): void {
        const action = this.extensionService.getActionById(id);

        if (action) {
            const { type, payload } = action;
            const context = { selection: undefined };
            const expression = this.extensionService.runExpression(payload, context);

            this.store.dispatch({
                type,
                payload: expression,
            });
        } else {
            this.store.dispatch({
                type: id,
            });
        }
    }
}
