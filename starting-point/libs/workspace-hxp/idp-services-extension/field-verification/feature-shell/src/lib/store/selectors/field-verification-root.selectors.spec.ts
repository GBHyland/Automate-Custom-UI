/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as selectors from './field-verification-root.selectors';
import { fieldVerificationRootState } from '../shared-mock-states';

describe('FieldVerificationRoot Selectors', () => {
    it('should select the document', () => {
        const result = selectors.documentFeatureSelector.projector(fieldVerificationRootState);
        expect(result).toEqual(fieldVerificationRootState.document);
    });

    it('should select the fields', () => {
        const result = selectors.documentFieldFeatureSelector.projector(fieldVerificationRootState);
        expect(result).toEqual(fieldVerificationRootState.fields);
    });

    it('should select the tables', () => {
        const result = selectors.documentTableFeatureSelector.projector(fieldVerificationRootState);
        expect(result).toEqual(fieldVerificationRootState.tables);
    });

    it('should select the screen', () => {
        const result = selectors.screenFeatureSelector.projector(fieldVerificationRootState);
        expect(result).toEqual(fieldVerificationRootState.screen);
    });
});
