/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EnvAppsPipe } from './env-apps.pipe';
import { mockApps, mockCurrentEnv, mockSortedApps, mockHomeName } from '../mocks/pipes/env-apps.pipe.mock';
import { TestBed } from '@angular/core/testing';
import { HOME_TOKEN } from '../tokens/home.token';

describe('EnvAppsPipe', () => {
    let pipe: EnvAppsPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                EnvAppsPipe,
                {
                    provide: HOME_TOKEN,
                    useValue: mockHomeName,
                },
            ],
        });

        pipe = TestBed.inject(EnvAppsPipe);
    });

    it('should return sorted app list with only apps that have either no env defined or the current env defined', () => {
        expect(pipe.transform(mockApps, mockCurrentEnv)).toEqual(mockSortedApps);
    });
});
