/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

import { Locator, Page } from '@playwright/test';
import { BaseComponent, HxpPropertiesViewerContainerComponent, timeouts } from '@alfresco-dbp/playwright/shared';
import { AdfBreadcrumbComponent } from './adf-breadcrumb.component';

export enum ViewerTypes {
    Pdf = 'adf-pdf-viewer',
    Img = 'adf-img-viewer',
    Word = 'adf-pdf-viewer',
    Excel = 'adf-pdf-viewer',
    Powerpoint = 'adf-pdf-viewer',
    Tiff = 'adf-pdf-viewer',
    Txt = 'adf-txt-viewer',
    UnknownFormat = 'adf-viewer-unknown-format',
    Loader = 'div.adf-viewer-render__loading-screen',
}

export class HxpDocumentViewerComponent extends BaseComponent {
    static rootElement = 'hxp-document-viewer';
    breadcrumb = new AdfBreadcrumbComponent(this.page);
    propertiesViewer = new HxpPropertiesViewerContainerComponent(this.page);

    constructor(page: Page) {
        super(page, HxpDocumentViewerComponent.rootElement);
    }

    adfViewerLocator = this.getChild('.adf-viewer');
    renderLocator = this.getChild('adf-viewer-render');
    closeButtonLocator = this.getChild('#document-viewer-close-button');
    infoButtonLocator = this.getChild('[data-automation-id="document-properties-viewer-button"]');
    moreActionsButtonLocator = this.getChild('hxp-document-more-action button');
    unknownFormatErrorMessage = this.getChild('.adf-viewer__unknown-label');
    versionSelector = this.getChild('hxp-document-version-selector [role="combobox"]');
    documentContent = this.getChild(`span[role='presentation']`).first();
    deleteDocumentButtonLocator = this.getChild('hxp-content-delete');
    getVersionDropdownList = this.getChild('.hxp-document-version-option').getByRole('option');

    getBreadcrumbArray = async () => this.breadcrumb.getBreadcrumbArray(this.rootElementString);
    getViewerByType = (viewerType: ViewerTypes): Locator => this.getChild(viewerType);
    waitforReload = async () => this.spinnerWaitForReload(ViewerTypes.Loader, timeouts.default);

    async getDocumentContent(): Promise<string> {
        const generatedDocumentContent = await this.renderLocator.allInnerTexts();
        const formattedContent = generatedDocumentContent.map((item) => item.replaceAll('\n', ' ').trim()).join(' ');
        const normalizedContent = formattedContent.replaceAll(/\s+/g, ' ');
        return normalizedContent;
    }
}
