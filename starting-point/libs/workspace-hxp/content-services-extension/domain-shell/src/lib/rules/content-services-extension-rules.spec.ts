/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { isContentServiceEnabled } from './content-services-extension-rules';

describe('ContentServicesExtensionRules', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should return true when content services extension is enabled', () => {
        localStorage.setItem('contentService', 'true');
        expect(isContentServiceEnabled()).toBeTruthy();
    });

    it('should return false when content services extension is disabled', () => {
        localStorage.setItem('contentService', 'false');
        expect(isContentServiceEnabled()).toBeFalsy();
    });

    it('should return true when content services extension is not defined in local storage', () => {
        expect(isContentServiceEnabled()).toBeTruthy();
    });
});
