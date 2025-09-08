/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { NavigationService } from './navigation.service';
import { mockUrl } from '../mocks/services/navigation.service.mock';

describe('NavigationService', () => {
    let service: NavigationService;

    beforeEach(() => {
        service = TestBed.inject(NavigationService);

        Object.defineProperty(window, 'location', {
            value: {
                href: '',
            },
            writable: true,
        });
    });

    it('should go to specified url', () => {
        service.goTo(mockUrl);
        expect(window.location.href).toBe(mockUrl);
    });
});
