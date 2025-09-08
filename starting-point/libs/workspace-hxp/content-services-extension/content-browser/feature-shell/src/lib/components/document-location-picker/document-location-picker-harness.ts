/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentHarness } from '@angular/cdk/testing';
import { MatInputHarness } from '@angular/material/input/testing';

export class DocumentLocationPickerHarness extends ComponentHarness {
    static hostSelector = '.hxp-document-location-picker';

    getLabel = this.documentRootLocatorFactory().locatorForOptional('#hxp-document-location-picker-label');

    getInput = this.documentRootLocatorFactory().locatorForOptional(
        MatInputHarness.with({
            selector: '#hxp-document-location-picker-input',
        })
    );

    getOverlayBackdrop = this.documentRootLocatorFactory().locatorForOptional('.cdk-overlay-backdrop');

    protected getOverlayContainer = this.documentRootLocatorFactory().locatorForOptional('.hxp-document-location-picker-overlay');

    async isOverlayOpened() {
        return !!(await this.getOverlayContainer());
    }
}
