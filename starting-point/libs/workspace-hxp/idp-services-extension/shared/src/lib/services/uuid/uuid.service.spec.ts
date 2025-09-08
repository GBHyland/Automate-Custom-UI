/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { UuidService } from './uuid.service';

describe('UuidService', () => {
    let service: UuidService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UuidService],
        });
        service = TestBed.inject(UuidService);
    });

    it('should generate a valid UUID', () => {
        const uuid = service.generate();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
        const uuid1 = service.generate();
        const uuid2 = service.generate();
        expect(uuid1).not.toEqual(uuid2);
    });
});
