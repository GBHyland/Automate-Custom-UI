/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpFieldVerificationDocumentViewerComponent extends BaseComponent {
    static rootElement = '.idp-viewer';

    readonly idpViewer: Locator;
    readonly singlePageView: Locator;
    readonly textLayoutSpanElement: Locator;
    readonly activeHighlightLocator: Locator;

    constructor(page: Page) {
        super(page, HxpIdpFieldVerificationDocumentViewerComponent.rootElement);
        this.idpViewer = this.getElementByAutomationId('idp-viewer');
        this.singlePageView = this.getElementByAutomationId('idp-single-page-view');
        this.textLayoutSpanElement = this.getElementByAutomationId('idp-viewer-text-only-layer__text-layout');
        this.activeHighlightLocator = this.getChild('.idp-layout-background-text__valid').first();
    }

    rotateButtonLocator = this.getChild('.idp-toolbar-button:has-text("rotate_right")');
    canvasLocator = this.getChild('.idp-viewer-text-layer__container-canvas');

    imageViewerLocator = this.getChild('.idp-single-page-view__image-container > div');

    async getRotationValue(): Promise<number | null> {
        const imageViewer = this.imageViewerLocator;
        const style = await imageViewer.getAttribute('style');
        const str = style ? style.match(/rotate:\s*(-?\d+)deg/) : null;
        return str ? Number(str[1]) : null;
    }

    async rotatePage(direction: 'Right', times = 1) {
        while (times-- > 0) {
            await this.rotateButtonLocator.click();
        }
    }

    async clickOnDocument(): Promise<void> {
        await this.canvasLocator.click();
    }
}
