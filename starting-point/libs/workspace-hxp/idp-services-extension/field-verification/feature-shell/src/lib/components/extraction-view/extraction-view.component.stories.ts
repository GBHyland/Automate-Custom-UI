/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { provideHttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { provideMockStore } from '@ngrx/store/testing';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';

import { I18nModule } from '../../configs/storybook/i18n.module';
import { ExtractionViewComponent } from './extraction-view.component';
import { initialFieldVerificationRootState } from '../../store/states/root.state';
import {
    documentFeatureSelector,
    documentFieldFeatureSelector,
    screenFeatureSelector,
} from '../../store/selectors/field-verification-root.selectors';
import { selectTaskInfo } from '../../store/selectors/screen.selectors';
import { IDP_FIELD_VERIFICATION_SERVICES_PROVIDER } from '../../services/idp-services.module';

export default {
    title: 'ExtractionViewComponent',
    component: ExtractionViewComponent,
    decorators: [
        applicationConfig({
            providers: [provideHttpClient()],
        }),
        moduleMetadata({
            imports: [MatIconModule, I18nModule, NoopTranslateModule],
            providers: [
                ...IDP_FIELD_VERIFICATION_SERVICES_PROVIDER,
                provideMockStore({
                    initialState: initialFieldVerificationRootState,
                    selectors: [
                        { selector: screenFeatureSelector, value: initialFieldVerificationRootState.screen },
                        { selector: documentFeatureSelector, value: initialFieldVerificationRootState.document },
                        { selector: documentFieldFeatureSelector, value: initialFieldVerificationRootState.fields },
                        { selector: selectTaskInfo, value: initialFieldVerificationRootState.screen.taskContext },
                    ],
                }),
            ],
        }),
    ],
    // eslint-disable-next-line prettier/prettier
} satisfies Meta<ExtractionViewComponent>;

export const Primary = {
    render: (args: ExtractionViewComponent) => ({
        props: args,
    }),
    args: {},
};
