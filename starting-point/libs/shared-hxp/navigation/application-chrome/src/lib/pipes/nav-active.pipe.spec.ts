/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { NavActivePipe } from './nav-active.pipe';
import { AppKeyService } from '../services/app-key.service';
import { mockAppV1, mockAppV2, mockCurrentAppKey } from '../mocks/pipes/nav-active.pipe.mock';

describe('NavActivePipe', () => {
    let pipe: NavActivePipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                NavActivePipe,
                {
                    provide: AppKeyService,
                    useValue: {
                        currentKey: mockCurrentAppKey,
                    },
                },
            ],
        });

        pipe = TestBed.inject(NavActivePipe);
    });

    it('should return true if appKey matches current appKey', () => {
        expect(pipe.transform(mockAppV1)).toBe(true);
    });

    it('should return false if appKey does not match current appKey', () => {
        expect(pipe.transform(mockAppV2)).toBe(false);
    });
});
