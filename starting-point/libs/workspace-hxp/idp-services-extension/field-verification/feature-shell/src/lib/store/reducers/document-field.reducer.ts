/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { documentFieldAdapter, initialDocumentFieldState } from '../states/document-field.state';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';

export const documentFieldReducer = createReducer(
    initialDocumentFieldState,

    on(systemActions.documentLoad, (state, { fields }) => {
        const firstFieldRequiringReview = fields.find((field) => field.verificationStatus === IdpVerificationStatus.AutoInvalid) || fields[0];
        return {
            ...documentFieldAdapter.setAll(fields, state),
            selectedFieldId: firstFieldRequiringReview?.id,
            loadState: IdpLoadState.Loaded,
        };
    }),

    on(userActions.fieldSelect, (state, { fieldId, needsKeyboardFocus }) => {
        return {
            ...state,
            selectedFieldId: fieldId,
            needsKeyboardFocus,
        };
    }),

    on(userActions.fieldValueUpdate, (state, { fieldId, value, boundingBox, confidence }) => {
        const field = state.entities[fieldId];
        return documentFieldAdapter.updateOne(
            {
                id: fieldId,
                changes: {
                    value,
                    // keep existing box if value did not change
                    boundingBox: boundingBox ?? (value === field?.value ? field.boundingBox : undefined),
                    verificationStatus: IdpVerificationStatus.ManualValid,
                    confidence,
                },
            },
            state
        );
    }),

    on(systemActions.movedToNextField, (state, { id }) => {
        return {
            ...state,
            selectedFieldId: id,
            needsKeyboardFocus: true,
        };
    }),

    on(userActions.verifyField, (state, { fieldId }) => {
        return documentFieldAdapter.updateOne(
            {
                id: fieldId,
                changes: {
                    verificationStatus: IdpVerificationStatus.ManualValid,
                },
            },
            state
        );
    }),

    on(userActions.addTableRowFields, (state, { fields }) => {
        return documentFieldAdapter.addMany(fields, state);
    }),

    on(userActions.clearTableRowFields, (state, { fields }) => {
        return documentFieldAdapter.updateMany(
            fields.map((field) => ({
                id: field.id,
                changes: {
                    value: field.value,
                    verificationStatus: IdpVerificationStatus.ManualValid,
                },
            })),
            state
        );
    }),

    on(userActions.updateTableRowFields, (state, { fields }) => {
        return documentFieldAdapter.updateMany(
            fields.map((field) => ({
                id: field.id,
                changes: {
                    value: field.value,
                    verificationStatus: field.verificationStatus,
                    confidence: field.confidence,
                    boundingBox: field.boundingBox,
                },
            })),
            state
        );
    }),

    on(userActions.clearTableColumnFields, (state, { fields }) => {
        return documentFieldAdapter.updateMany(
            fields.map((field) => ({
                id: field.id,
                changes: {
                    value: field.value,
                    verificationStatus: IdpVerificationStatus.ManualValid,
                },
            })),
            state
        );
    }),

    on(userActions.updateTableColumnFields, (state, { fields }) => {
        return documentFieldAdapter.updateMany(
            fields.map((field) => ({
                id: field.id,
                changes: {
                    value: field.value,
                    verificationStatus: field.verificationStatus,
                    confidence: field.confidence,
                    boundingBox: field.boundingBox,
                    // hasIssue: field.hasIssue,
                },
            })),
            state
        );
    }),

    on(userActions.insertTableRowFields, (state, { fields }) => {
        return documentFieldAdapter.addMany(fields, state);
    }),

    on(userActions.deleteTableRowFields, (state, { fieldIds }) => {
        return documentFieldAdapter.removeMany(fieldIds, state);
    }),

    on(userActions.deleteTableFields, (state, { fieldIds }) => {
        return documentFieldAdapter.removeMany(fieldIds, state);
    }),

    on(userActions.restoreTableFields, (state, { fields }) => {
        return documentFieldAdapter.addMany(fields, state);
    })
);
