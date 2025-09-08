/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { documentClassAdapter, initialDocumentClassState } from '../states/document-class.state';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { IdpConfigClass, SYS_DOCUMENT_CLASS_REJECTED, SYS_DOCUMENT_CLASS_UNCLASSIFIED } from '../../models/screen-models';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';

export const documentClassReducer = createReducer(
    initialDocumentClassState,

    on(systemActions.screenLoadSuccess, (state, { taskData }) => {
        const availableClasses: IdpConfigClass[] =
            taskData?.configuration?.documentClassDefinitions?.map((taskClass) => {
                return {
                    id: taskClass.id,
                    name: taskClass.name,
                    isSpecialClass: false,
                    isPreviewed: false,
                };
            }) || [];
        availableClasses.unshift(SYS_DOCUMENT_CLASS_UNCLASSIFIED);
        availableClasses.unshift(SYS_DOCUMENT_CLASS_REJECTED);

        return documentClassAdapter.addMany(availableClasses, {
            ...state,
            loadState: IdpLoadState.Loaded,
        });
    }),

    on(userActions.classSelect, (state, { classId }) => {
        const expandedClassId = state.expandedClassId !== undefined && state.expandedClassId !== classId ? undefined : state.expandedClassId;
        return { ...state, selectedClassId: classId, expandedClassId };
    }),

    on(userActions.classExpandToggle, (state, { classId }) => {
        const expandedClassId = state.expandedClassId === classId ? undefined : classId;
        return { ...state, expandedClassId };
    }),

    on(userActions.classPreviewToggle, (state, { classId }) => {
        const previewedClassId = state.previewedClassId === classId ? undefined : classId;
        return { ...state, previewedClassId };
    })
);
