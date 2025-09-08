/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpExtractionResultContainer extends BaseComponent {
    static rootElement = '.idp-extraction-view';

    readonly thumbnailViewerButton: Locator;
    readonly previousPage: Locator;
    readonly nextPage: Locator;
    readonly pageNavInput: Locator;
    readonly viewImageButton: Locator;
    readonly viewExtractedTextButton: Locator;
    readonly zoomImageIn: Locator;
    readonly zoomImageOut: Locator;
    readonly zoomInput: Locator;
    readonly rotateImageClockwise: Locator;
    readonly viewerFullScreen: Locator;
    readonly thumbnailViewerClose: Locator;
    readonly thumbnail1: Locator;
    readonly thumbnail2: Locator;
    readonly thumbnail3: Locator;

    constructor(page: Page) {
        super(page, HxpIdpExtractionResultContainer.rootElement);
        this.thumbnailViewerButton = this.getElementByAutomationId('ThumbnailViewerButton');
        this.previousPage = this.getElementByAutomationId('PageNavigationButton1');
        this.nextPage = this.getElementByAutomationId('PageNavigationButton2');
        this.pageNavInput = this.getElementByAutomationId('idp-page-nav-input');
        this.viewImageButton = this.getElementByAutomationId('LayerSelectionButton1');
        this.viewExtractedTextButton = this.getElementByAutomationId('LayerSelectionButton2');
        this.zoomImageIn = this.getElementByAutomationId('ZoomButton1');
        this.zoomImageOut = this.getElementByAutomationId('ZoomButton2');
        this.zoomInput = this.getElementByAutomationId('idp-zoom-input');
        this.rotateImageClockwise = this.getElementByAutomationId('RotateButton');
        this.viewerFullScreen = this.getElementByAutomationId('FullScreenButton');
        this.thumbnailViewerClose = this.getElementByAutomationId('thumbnail-viewer-close-button');
        this.thumbnail1 = this.getElementByAutomationId('thumbnail-1');
        this.thumbnail2 = this.getElementByAutomationId('thumbnail-2');
        this.thumbnail3 = this.getElementByAutomationId('thumbnail-3');
    }

    getExtractionResultIcon(status: string) {
        return this.getElementByAutomationId(`idp-field-extraction-result-icon-${status}`);
    }

    getExtractionResultText(status: string) {
        return this.getElementByAutomationId(`idp-field-extraction-result-text-${status}`);
    }
}
