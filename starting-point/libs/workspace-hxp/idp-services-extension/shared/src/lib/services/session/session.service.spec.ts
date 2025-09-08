/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { SessionService } from './session.service';
import { SharedVerificationRootState } from '../../store/states/shared-verification-root.state';
import { SessionState } from '../../store/states/session.state';
import { sharedUserActions } from '../../store/actions/verification.actions';

describe('SessionService', () => {
    let service: SessionService;
    let mockStore: jest.Mocked<Store<SharedVerificationRootState>>;

    const mockSessionState: SessionState = {
        isAutoNextTaskChecked: false,
    };

    beforeEach(() => {
        mockStore = {
            select: jest.fn().mockReturnValue(of(mockSessionState)),
            dispatch: jest.fn(),
        } as unknown as jest.Mocked<Store<SharedVerificationRootState>>;

        TestBed.configureTestingModule({
            providers: [SessionService, { provide: Store, useValue: mockStore }],
        });

        service = TestBed.inject(SessionService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('toggleAutoNextTask', () => {
        it('should dispatch toggleAutoNextTask action', () => {
            const expectedAction = sharedUserActions.toggleAutoNextTask();

            service.toggleAutoNextTask();

            expect(mockStore.dispatch).toHaveBeenCalledWith(expectedAction);
        });
    });
});
