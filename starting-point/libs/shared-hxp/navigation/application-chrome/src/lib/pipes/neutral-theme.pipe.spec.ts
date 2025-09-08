/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { NeutralThemePipe } from './neutral-theme.pipe';
import { CONTROL_CENTER_TOKEN } from '../tokens/control-center.token';
import { mockAppEnvV1, mockAppEnvV2, mockControlCenterEnv } from '../mocks/pipes/neutral-theme.pipe.mock';

describe('NeutralThemePipe', () => {
    let pipe: NeutralThemePipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                NeutralThemePipe,
                {
                    provide: CONTROL_CENTER_TOKEN,
                    useValue: mockControlCenterEnv,
                },
            ],
        });

        pipe = TestBed.inject(NeutralThemePipe);
    });

    it('create return true if app env is control center env', () => {
        expect(pipe.transform(mockAppEnvV1)).toBe(true);
    });

    it('create return false if app env is not control center env', () => {
        expect(pipe.transform(mockAppEnvV2)).toBe(false);
    });
});
