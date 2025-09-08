/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { classVerificationStateName } from './states/root.state';
import { getClassVerificationRootReducer, metaReducers } from './reducers/class-verification-root.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ScreenEffects } from './effects/screen.effects';
import { DocumentEffects } from './effects/document.effects';
import { IdpDocumentHxpImportService } from '../services/document-import/idp-document-hxp-import.service';
import { IdpDocumentImportDialogService } from '../services/document-import/idp-document-import-dialog.service';
import { ScreenImportingDocumentEffects } from './effects/screen-importing-document.effects';
import { IdpDocumentImportService } from '../services/document-import/idp-document-import.service';
import { IdpDocumentMetadataService } from '../services/document-import/idp-document-metadata.service';

@NgModule({
    imports: [
        StoreModule.forFeature(classVerificationStateName, getClassVerificationRootReducer, { metaReducers }),
        EffectsModule.forFeature([ScreenEffects, DocumentEffects, ScreenImportingDocumentEffects]),
    ],
    providers: [
        {
            provide: IdpDocumentImportService,
            useClass: IdpDocumentHxpImportService,
        },
        IdpDocumentImportDialogService,
        IdpDocumentMetadataService,
    ],
})
export class ClassVerificationStoreModule {}
