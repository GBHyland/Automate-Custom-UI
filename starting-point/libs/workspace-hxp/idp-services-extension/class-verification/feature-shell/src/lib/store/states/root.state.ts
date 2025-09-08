/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentPageState, initialDocumentPageState } from './document-page.state';
import { DocOpUndoRedoState, initialDocOpUndoRedoState } from './doc-op-undo-redo.state';
import { DocumentClassState, initialDocumentClassState } from './document-class.state';
import { DocumentState, initialDocumentState } from './document.state';
import { initialScreenState, ScreenState } from './screen.state';
import { initialScreenImportingDocumentState, ScreenImportingDocumentState } from './importing-document.state';

export const classVerificationStateName = 'idp-class-verification';

export interface ClassVerificationRootState {
    documents: DocumentState;
    documentPages: DocumentPageState;
    documentClasses: DocumentClassState;
    screen: ScreenState;
    screenImportingDocuments: ScreenImportingDocumentState;
    undoRedo: DocOpUndoRedoState;
}

export const initialClassVerificationRootState: ClassVerificationRootState = {
    documents: initialDocumentState,
    documentPages: initialDocumentPageState,
    documentClasses: initialDocumentClassState,
    screen: initialScreenState,
    screenImportingDocuments: initialScreenImportingDocumentState,
    undoRedo: initialDocOpUndoRedoState,
};
