/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HxpIdpShortcutDialogComponent, HxpIdpStickyButtonsComponent } from '../components/idp-classification-components';
import {
    // uncomment as we need to use them
    // FieldVerificationRootContainer,
    HxpIdpExtractionResultContainer,
    HxpIdpFieldVerificationDocumentViewerComponent,
    HxpIdpFieldVerificationHeaderComponent,
    HxpIdpFieldVerificationViewerTextLayer,
    HxpIdpFooterContainer,
    HxpIdpMetadataPanelComponent,
    HxpIdpRejectFieldDialog,
} from '../components/idp-field-verification-components';
import { TaskDetailsPage } from './task-details.page';

export class FieldVerificationPage extends TaskDetailsPage {
    shortcutDialog = new HxpIdpShortcutDialogComponent(this.page);
    stickyButtons = new HxpIdpStickyButtonsComponent(this.page);
    documentViewer = new HxpIdpFieldVerificationDocumentViewerComponent(this.page);
    fieldVerificationFooter = new HxpIdpFooterContainer(this.page);
    fieldVerificationDocumentViewer = new HxpIdpFieldVerificationDocumentViewerComponent(this.page);
    fieldVerificationExtractionResult = new HxpIdpExtractionResultContainer(this.page);
    fieldVerificationHeader = new HxpIdpFieldVerificationHeaderComponent(this.page);
    fieldVerificationViewerTextLayer = new HxpIdpFieldVerificationViewerTextLayer(this.page);
    metadataPanel = new HxpIdpMetadataPanelComponent(this.page);
    rejectFieldDialog = new HxpIdpRejectFieldDialog(this.page);
    // uncomment as we need to use them
    // fieldVerificationContainer = new FieldVerificationRootContainer(this.page);
}
