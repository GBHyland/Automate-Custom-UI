/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import {
    HxpIdpDocumentBrowserComponent,
    HxpIdpFooterContainer,
    HxpIdpFloaterToolbarComponent,
    HxpIdpChangeClassDialog,
    HxpIdpRejectClassDialog,
    HxpIdpConfirmDialogComponent,
    HxpIdpClassificationHeaderComponent,
    HxpIdpShortcutDialogComponent,
    HxpIdpStickyButtonsComponent,
    HxpIdpUploadProgressDialogComponent,
    HxpIdpOverlayContainerComponent,
} from '../components/idp-classification-components';
import { HomePage } from './';
import { SnackBarComponent } from '@alfresco-dbp/playwright/shared';

let taskId;

export class ClassificationPage extends HomePage {
    private static pageUrl = `task-details-cloud/${taskId}`;
    constructor(page: Page) {
        super(page, ClassificationPage.pageUrl);
    }

    documentBrowser = new HxpIdpDocumentBrowserComponent(this.page);
    idpClassFooter = new HxpIdpFooterContainer(this.page);
    floaterToolbar = new HxpIdpFloaterToolbarComponent(this.page);
    changeClassDialog = new HxpIdpChangeClassDialog(this.page);
    rejectClassDialog = new HxpIdpRejectClassDialog(this.page);
    confirmDialog = new HxpIdpConfirmDialogComponent(this.page);
    uploadProgressDialog = new HxpIdpUploadProgressDialogComponent(this.page);
    classificationHeader = new HxpIdpClassificationHeaderComponent(this.page);
    shortcutDialog = new HxpIdpShortcutDialogComponent(this.page);
    stickyButtons = new HxpIdpStickyButtonsComponent(this.page);
    overlayContainer = new HxpIdpOverlayContainerComponent(this.page);
    override snackBar = new SnackBarComponent(this.page);
}
