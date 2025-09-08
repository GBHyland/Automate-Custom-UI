/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs';
import { sharedUserActions } from '../../store/actions/verification.actions';
import { SharedVerificationRootState } from '../../store/states/shared-verification-root.state';
import { selectIsAutoNextTaskChecked } from '../../store/selectors/session.selectors';

@Injectable()
export class SessionService {
    private readonly store = inject(Store<SharedVerificationRootState>);

    readonly isAutoNextTaskChecked$ = this.store.select(selectIsAutoNextTaskChecked).pipe(distinctUntilChanged());

    toggleAutoNextTask() {
        this.store.dispatch(sharedUserActions.toggleAutoNextTask());
    }
}
