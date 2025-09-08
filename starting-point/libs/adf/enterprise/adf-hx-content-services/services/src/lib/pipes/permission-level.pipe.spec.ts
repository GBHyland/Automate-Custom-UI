/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { PermissionLevelPipe } from './permission-level.pipe';

describe('PermissionLevelPipe', () => {
    let pipe: PermissionLevelPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PermissionLevelPipe],
        });
        pipe = TestBed.inject(PermissionLevelPipe);
    });

    it('should return correct permission level and class for ManageSecurity permission', () => {
        const result = pipe.transform(['ManageSecurity']);
        expect(result).toEqual({ value: 'PERMISSION_LEVEL.LABEL.EVERYTHING', class: 'everything' });
    });

    it('should return correct permission level and class for Read permission', () => {
        const result = pipe.transform(['Read']);
        expect(result).toEqual({ value: 'PERMISSION_LEVEL.LABEL.READ', class: 'read' });
    });

    it('should return correct permission level and class for ReadWrite permission', () => {
        const result = pipe.transform(['ReadWrite']);
        expect(result).toEqual({ value: 'PERMISSION_LEVEL.LABEL.READ_WRITE', class: 'readWrite' });
    });

    it('should return correct permission level and class for no permissions', () => {
        const result = pipe.transform([]);
        expect(result).toEqual({ value: '', class: '' });
    });

    it('should return correct permission level and class for unknown permission', () => {
        const result = pipe.transform(['UnknownPermission']);
        expect(result).toEqual({ value: '', class: '' });
    });
});
