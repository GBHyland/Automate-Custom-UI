/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { InitialEnvPipe } from './initial-env.pipe';
import { AppKeyService } from '../services/app-key.service';
import { CONTROL_CENTER_TOKEN } from '../tokens/control-center.token';
import {
    mockAppEnv,
    mockApps,
    mockControlCenterEnv,
    mockCurrentAppKeyNotListed,
    mockCurrentAppKeyV1,
    mockCurrentAppKeyV2,
} from '../mocks/pipes/initial-env.pipe.mock';

describe('InitialEnvPipe', () => {
    let pipe: InitialEnvPipe;

    function initTest(currentAppKey: string) {
        TestBed.configureTestingModule({
            providers: [
                InitialEnvPipe,
                {
                    provide: AppKeyService,
                    useValue: {
                        currentKey: currentAppKey,
                    },
                },
                {
                    provide: CONTROL_CENTER_TOKEN,
                    useValue: mockControlCenterEnv,
                },
            ],
        });

        pipe = TestBed.inject(InitialEnvPipe);
    }

    it('should return current app env if app is listed and app has env defined', () => {
        initTest(mockCurrentAppKeyV1);
        expect(pipe.transform(mockApps)).toEqual(mockAppEnv);
    });

    it('should return control center env if app is listed but app does not have env defined', () => {
        initTest(mockCurrentAppKeyV2);
        expect(pipe.transform(mockApps)).toEqual(mockControlCenterEnv);
    });

    it('should return control center env if app is not listed', () => {
        initTest(mockCurrentAppKeyNotListed);
        expect(pipe.transform(mockApps)).toEqual(mockControlCenterEnv);
    });
});
