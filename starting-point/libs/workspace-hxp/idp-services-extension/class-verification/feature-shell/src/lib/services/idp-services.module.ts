/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpDocumentClassService } from './document-class/idp-document-class.service';
import { IdpDocumentToolbarService } from './document/idp-document-toolbar.service';
import { IdpDocumentService } from './document/idp-document.service';
import { ClassVerificationContextTaskService } from './context-task/class-verification-context-task.service';
import { IdpDocumentMultiselectService } from './document/idp-document-multiselect.service';
import { IdpKeyboardNavigationService } from './document/idp-keyboard-navigation.service';
import { CLASS_VERIFICATION_SCREEN_SHORTCUT_PROVIDER } from './shortcut/idp-classification-shortcuts';
import { IdpImageLoadingService } from './image/idp-image-loading.service';
import { IdpContextTaskBaseService, IdpShortcutService, SessionService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { IdpDocumentDragDropService } from './document/idp-drag-drop.service';

export const IDP_CLASS_VERIFICATION_SERVICES_PROVIDER = [
    {
        provide: IdpContextTaskBaseService,
        useClass: ClassVerificationContextTaskService,
    },
    CLASS_VERIFICATION_SCREEN_SHORTCUT_PROVIDER,
    ClassVerificationContextTaskService,
    IdpDocumentClassService,
    IdpDocumentToolbarService,
    IdpDocumentService,
    IdpDocumentMultiselectService,
    IdpImageLoadingService,
    IdpKeyboardNavigationService,
    IdpShortcutService,
    IdpDocumentDragDropService,
    SessionService,
];
