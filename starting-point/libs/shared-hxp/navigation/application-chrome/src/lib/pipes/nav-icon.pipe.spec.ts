/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { NAV_ICONS_TOKEN } from '../tokens/nav-icons.token';
import { NavIconPipe } from './nav-icon.pipe';
import { mockAppV1, mockAppV2, mockAppV3, mockIconV1, mockIconV2, mockNavIcons } from '../mocks/pipes/nav-icon.pipe.mock';

describe('NavIconPipe', () => {
    let pipe: NavIconPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                NavIconPipe,
                {
                    provide: NAV_ICONS_TOKEN,
                    useValue: mockNavIcons,
                },
            ],
        });

        pipe = TestBed.inject(NavIconPipe);
    });

    it('should return icon if icon list contains app id', () => {
        expect(pipe.transform(mockAppV1)).toBe(mockIconV1);
        expect(pipe.transform(mockAppV2)).toBe(mockIconV2);
    });

    it('should return undefined if icon list does not contain app id', () => {
        expect(pipe.transform(mockAppV3)).toBe(undefined);
    });
});
