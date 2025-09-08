/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { NavEnvsPipe } from './nav-envs.pipe';
import { TranslateService } from '@ngx-translate/core';
import { mockAppEnvs, mockNavEnvs } from '../mocks/pipes/nav-envs.pipe.mock';

describe('NavEnvsPipe', () => {
    let pipe: NavEnvsPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                NavEnvsPipe,
                {
                    provide: TranslateService,
                    useValue: {
                        instant: (s: string) => s,
                    },
                },
            ],
        });

        pipe = TestBed.inject(NavEnvsPipe);
    });

    it('should return empty nav-env list if app-env list is empty', () => {
        expect(pipe.transform([])).toEqual([]);
    });

    it('should return nav-env list mapped from app-env-list', () => {
        expect(pipe.transform(mockAppEnvs)).toEqual(mockNavEnvs);
    });
});
