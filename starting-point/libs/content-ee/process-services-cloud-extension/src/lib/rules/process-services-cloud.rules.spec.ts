/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as rules from './process-services-cloud.rules';

describe('isProcessServiceCloudPluginEnabled rule', () => {
    let getItemSpy: jasmine.Spy;

    beforeEach(() => {
        getItemSpy = spyOn(localStorage, 'getItem');
    });

    it('Should return true when processService is enabled', () => {
        getItemSpy.and.returnValue('true');
        expect(rules.isProcessServiceCloudPluginEnabled()).toBe(true);
    });

    it('Should return false when processService is disabled', () => {
        getItemSpy.and.returnValue('false');
        expect(rules.isProcessServiceCloudPluginEnabled()).toBe(false);
    });
});
