/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpFieldVerificationViewerTextLayer extends BaseComponent {
    static rootElement = '.idp-viewer-container';

    constructor(page: Page) {
        super(page, HxpIdpFieldVerificationViewerTextLayer.rootElement);
    }
    ocrToolTip = this.getElementByAutomationId('ocr-tooltip');
    textLayerCanvas = this.getElementByAutomationId('viewer-text-layer-canvas');
    splitterPaneDocument = this.getElementByAutomationId('idp-viewer-splitter-pane-document');
    splitterPaneTable = this.getElementByAutomationId('idp-viewer-splitter-pane-table');
    tableSplitterBar = this.getElementByAutomationId('idp-viewer-splitter-bar');
}
