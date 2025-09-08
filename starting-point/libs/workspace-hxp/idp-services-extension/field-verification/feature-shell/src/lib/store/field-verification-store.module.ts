/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DocumentEffects } from './effects/document.effects';
import { fieldVerificationStateName } from './states/root.state';
import { getFieldVerificationRootReducer, metaReducers } from './reducers/field-verification-root.reducer';
import { ScreenEffects } from './effects/screen.effects';
import { UuidService } from '@hxp/workspace-hxp/idp-services-extension/shared';

@NgModule({
    imports: [
        StoreModule.forFeature(fieldVerificationStateName, getFieldVerificationRootReducer, { metaReducers }),
        EffectsModule.forFeature([ScreenEffects, DocumentEffects]),
    ],
    providers: [UuidService],
})
export class FieldVerificationStoreModule {}
