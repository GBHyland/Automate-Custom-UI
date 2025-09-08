/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ContextAppsPipe } from './context-apps.pipe';
import { CONTROL_CENTER_TOKEN } from '../tokens/control-center.token';
import { HOME_TOKEN } from '../tokens/home.token';
import { mockApps, mockControlCenterEnv, mockGlobalApps, mockHomeName } from '../mocks/pipes/context-apps.pipe.mock';
import { firstValueFrom, of } from 'rxjs';

describe('ContextAppsPipe', () => {
    let pipe: ContextAppsPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ContextAppsPipe,
                {
                    provide: CONTROL_CENTER_TOKEN,
                    useValue: mockControlCenterEnv,
                },
                {
                    provide: HOME_TOKEN,
                    useValue: mockHomeName,
                },
            ],
        });

        pipe = TestBed.inject(ContextAppsPipe);
    });

    it('should return context app list based on global apps object', async () => {
        expect(await firstValueFrom(pipe.transform(of(mockGlobalApps)))).toEqual(mockApps);
    });
});
