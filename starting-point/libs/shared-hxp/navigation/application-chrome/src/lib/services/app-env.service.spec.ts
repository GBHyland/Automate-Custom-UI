/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { AppEnvService } from './app-env.service';
import { firstValueFrom } from 'rxjs';
import { mockAppEnv, mockNavEnv } from '../mocks/services/app-env.service.mock';

describe('AppEnvService', () => {
    let service: AppEnvService;

    beforeEach(() => {
        service = TestBed.inject(AppEnvService);
    });

    it('should update selectedEnv$ based on nav-env provided', async () => {
        expect(await firstValueFrom(service.selectedEnv$)).toBe(undefined);
        service.onEnvChange(mockNavEnv);
        expect(await firstValueFrom(service.selectedEnv$)).toEqual(mockAppEnv);
    });
});
