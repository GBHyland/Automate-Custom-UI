/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IdpDocumentService } from './idp-document.service';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { userActions } from '../../store/actions/class-verification.actions';
import { IdpConfigClass, IdpDocument, IdpDocumentAction, IdpDocumentPage } from '../../models/screen-models';
import { mockIdpDocuments } from '../../models/mocked/mocked-documents';
import { DestroyRef } from '@angular/core';
import { mockDocumentEntitiesByIdpDocuments } from '../../store/models/mocked/mocked-documents';
import { mockIdpConfigClasses } from '../../models/mocked/mocked-classes';
import { classVerificationStateName, initialClassVerificationRootState } from '../../store/states/root.state';
import { documentAdapter, initialDocumentState } from '../../store/states/document.state';
import { documentClassAdapter, initialDocumentClassState } from '../../store/states/document-class.state';
import { selectCanRedo, selectCanUndo } from '../../store/selectors/undo-redo.selectors';
import { selectSortOption, selectViewFilter } from '../../store/selectors/screen.selectors';
import {
    selectAllDocumentClasses,
    selectAllDocuments,
    selectAllDocumentsValid,
    selectAllSelectedDocuments,
    selectAllSelectedPages,
    selectSelectedDocumentClass,
} from '../../store/selectors/document.selectors';
import { asapScheduler } from 'rxjs';
import { IdpPagesMetadata } from '../../store/models/document-state-updates';
import { IdpScreenViewSortOption } from '../../models/common-models';

describe('IdpDocumentService', () => {
    let service: IdpDocumentService;
    let store: MockStore;
    let storeDispatchSpy: jasmine.Spy;
    let mockClasses: IdpConfigClass[];
    let mockDocuments: IdpDocument[];

    beforeEach(() => {
        mockClasses = mockIdpConfigClasses();
        mockDocuments = mockIdpDocuments();
        const entities = mockDocumentEntitiesByIdpDocuments(mockDocuments);
        const mockState = {
            [classVerificationStateName]: {
                ...initialClassVerificationRootState,
                documents: documentAdapter.setAll(entities, initialDocumentState),
                documentClasses: documentClassAdapter.setAll(mockClasses, initialDocumentClassState),
            },
        };

        TestBed.configureTestingModule({
            providers: [
                IdpDocumentService,
                provideMockStore({
                    initialState: mockState,
                    selectors: [
                        { selector: selectAllDocuments, value: [] },
                        { selector: selectSelectedDocumentClass, value: undefined },
                        { selector: selectViewFilter, value: 'All' },
                        { selector: selectAllDocumentsValid, value: true },
                        { selector: selectAllSelectedDocuments, value: [] },
                        { selector: selectAllSelectedPages, value: [] },
                        { selector: selectCanUndo, value: true },
                        { selector: selectCanRedo, value: false },
                    ],
                }),
                DestroyRef,
            ],
        });

        service = TestBed.inject(IdpDocumentService);
        store = TestBed.inject(MockStore);

        storeDispatchSpy = spyOn(store, 'dispatch');
    });

    afterEach(() => {
        store.resetSelectors();
    });

    it('should initialize all documents', fakeAsync(() => {
        store.overrideSelector(selectAllDocuments, mockDocuments);
        store.refreshState();

        let result: IdpDocument[] = [];
        service.allDocuments$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual(mockDocuments);
    }));

    it('should initialize all documents for selected classes', fakeAsync(() => {
        store.overrideSelector(selectAllDocuments, mockDocuments);
        store.overrideSelector(selectAllDocumentClasses, mockClasses);
        store.overrideSelector(selectSelectedDocumentClass, mockClasses[2]);
        store.overrideSelector(selectViewFilter, 'All');
        store.refreshState();

        let result: IdpDocument[] = [];
        service.allDocumentsForSelectedClass$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual(mockDocuments.filter((doc) => doc.class?.id === mockClasses[2].id));
    }));

    it('should initialize empty all documents for selected classes when no classes are selected', fakeAsync(() => {
        // eslint-disable-next-line unicorn/no-useless-undefined
        store.overrideSelector(selectSelectedDocumentClass, undefined);
        store.overrideSelector(selectViewFilter, 'All');
        store.refreshState();

        let result: IdpDocument[] = [];
        service.allDocumentsForSelectedClass$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual([]);
    }));

    it('should initialize all documents with issues for selected classes', fakeAsync(() => {
        store.overrideSelector(selectAllDocuments, mockDocuments);
        store.overrideSelector(selectAllDocumentClasses, mockClasses);
        store.overrideSelector(selectSelectedDocumentClass, mockClasses[2]);
        store.overrideSelector(selectViewFilter, 'OnlyIssues');
        store.refreshState();

        let result: IdpDocument[] = [];
        service.allDocumentsForSelectedClass$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual(mockDocuments.filter((doc) => doc.class?.id === mockClasses[2].id && doc.hasIssue));
    }));

    it('should initialize all pages for selected class', fakeAsync(() => {
        store.overrideSelector(selectAllDocuments, mockDocuments);
        store.overrideSelector(selectAllDocumentClasses, mockClasses);
        store.overrideSelector(selectSelectedDocumentClass, mockClasses[2]);
        store.overrideSelector(selectViewFilter, 'All');
        store.refreshState();

        let result: IdpDocumentPage[] = [];
        service.allPagesForSelectedClass$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual(mockDocuments.filter((doc) => doc.class?.id === mockClasses[2].id).flatMap((doc) => doc.pages));
    }));

    it('should initialize all documents valid flag observable', fakeAsync(() => {
        store.overrideSelector(selectAllDocumentsValid, true);
        store.refreshState();

        let result = false;
        service.allDocumentsValid$.subscribe((data) => (result = data));

        flush();

        expect(result).toBeTrue();
    }));

    it('should initialize all selected documents', fakeAsync(() => {
        const mockSelectedDocuments = [mockDocuments[1], mockDocuments[3]];
        store.overrideSelector(selectAllSelectedDocuments, mockSelectedDocuments);
        store.refreshState();

        let result: IdpDocument[] = [];
        service.selectedDocuments$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual(mockSelectedDocuments);
    }));

    it('should initialize all selected pages', fakeAsync(() => {
        const mockSelectedPages = [mockDocuments[1].pages[0], ...mockDocuments[3].pages];
        store.overrideSelector(selectAllSelectedPages, mockSelectedPages);
        store.refreshState();

        let result: IdpDocumentPage[] = [];
        service.selectedPages$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual(mockSelectedPages);
    }));

    it('should initialize all selected documents', fakeAsync(() => {
        store.overrideSelector(selectViewFilter, 'OnlyIssues');
        store.refreshState();

        let result = 'All';
        service.documentViewFilter$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual('OnlyIssues');
    }));

    it('should initialize undo redo state', fakeAsync(() => {
        store.overrideSelector(selectCanUndo, false);
        store.overrideSelector(selectCanRedo, true);
        store.refreshState();

        let result = { canUndo: true, canRedo: false };
        service.undoRedoState$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual({ canUndo: false, canRedo: true });
    }));

    it('should dispatch on updated selected pages when document list filtered by class changes', fakeAsync(() => {
        store.overrideSelector(selectAllDocuments, mockDocuments);
        store.overrideSelector(selectAllDocumentClasses, mockClasses);
        store.overrideSelector(selectSelectedDocumentClass, mockClasses[2]);
        store.overrideSelector(selectViewFilter, 'All');
        store.overrideSelector(selectSortOption, IdpScreenViewSortOption.Classes);

        const mockSelectedPages = [mockDocuments[1].pages[0], ...mockDocuments[3].pages];
        store.overrideSelector(selectAllSelectedPages, mockSelectedPages);
        store.refreshState();

        asapScheduler.flush();

        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.pageSelect({ pageIds: [mockDocuments[1].pages[0].id] }));
    }));

    it('should dispatch on set selected pages', () => {
        service.setSelectedPages(['0_1', '0_2', '1_0']);
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.pageSelect({ pageIds: ['0_1', '0_2', '1_0'] }));
    });

    it('should dispatch on toggle expand document', () => {
        service.toggleExpandDocument('d_cf2');
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.documentExpandToggle({ documentId: 'd_cf2' }));
    });

    it('should dispatch on reset page selection', () => {
        service.resetPageSelection();
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.pageSelect({ pageIds: [] }));
    });

    it('should dispatch on set document view filter', () => {
        service.setDocumentViewFilter('All');
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.viewFilterChange({ filter: 'All' }));
    });

    it('should dispatch on toggle view filter', () => {
        service.toggleViewFilter();
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.viewFilterToggle());
    });

    it('should dispatch on change full screen', () => {
        service.changeFullScreen(true);
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.changeFullScreen({ fullScreen: true }));
    });

    it('should dispatch updatePagesRotation', () => {
        const pages: IdpPagesMetadata[] = [
            {
                pageId: '0_1',
                documentId: 'd_cf2',
                viewerRotation: 90,
                rotation: 0,
            },
        ];
        service.updatePagesRotation(pages, false);
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.updatePagesRotation({ pages, taskDataSynced: false }));
    });

    it('should dispatch on set document class', () => {
        const documentAction = IdpDocumentAction.ChangeClass;
        const canUndoAction = true;
        const documents = mockIdpDocuments();
        const pages = [documents[0].pages[0], documents[1].pages[0]];
        const classId = 'payslips';

        service.setDocumentClass(documentAction, canUndoAction, pages, classId);

        const action = userActions.documentClassChange({ docAction: documentAction, canUndoAction, pages, classId });
        expect(storeDispatchSpy).toHaveBeenCalledWith(action);
    });

    it('should dispatch on delete pages', () => {
        const documentAction = IdpDocumentAction.Delete;
        const canUndoAction = true;
        const documents = mockIdpDocuments();
        const pages = [documents[0].pages[0], documents[1].pages[0]];

        service.deletePages(documentAction, canUndoAction, pages);

        const action = userActions.pageDelete({ docAction: documentAction, canUndoAction, pages });
        expect(storeDispatchSpy).toHaveBeenCalledWith(action);
    });

    it('should dispatch on move pages', () => {
        const documentAction = IdpDocumentAction.MovePage;
        const canUndoAction = true;
        const documents = mockIdpDocuments();
        const pages = [documents[0].pages[0], documents[1].pages[0]];
        const targetDocumentId = 'd_cf2';
        const targetIndex = 2;

        service.movePages(documentAction, canUndoAction, pages, targetDocumentId, targetIndex);

        const action = userActions.pageMove({ docAction: documentAction, canUndoAction, pages, targetDocumentId, targetIndex });
        expect(storeDispatchSpy).toHaveBeenCalledWith(action);
    });

    it('should dispatch on move pages and create', () => {
        const documentAction = IdpDocumentAction.MovePageAndCreate;
        const canUndoAction = true;
        const documents = mockIdpDocuments();
        const pages = [documents[0].pages[0], documents[1].pages[0]];
        const createAfterDocId = 'd_cf2';

        service.movePagesAndCreate(documentAction, canUndoAction, pages, createAfterDocId);

        const action = userActions.pageSplit({ docAction: documentAction, canUndoAction, pages, createAfterDocId });
        expect(storeDispatchSpy).toHaveBeenCalledWith(action);
    });

    it('should dispatch on split document', () => {
        const documentAction = IdpDocumentAction.Split;
        const canUndoAction = true;
        const documents = mockIdpDocuments();
        const pages = [documents[0].pages[0], documents[1].pages[0]];

        service.splitDocument(documentAction, canUndoAction, pages);

        const action = userActions.pageSplit({ docAction: documentAction, canUndoAction, pages });
        expect(storeDispatchSpy).toHaveBeenCalledWith(action);
    });

    it('should dispatch on merge documents', () => {
        const documentAction = IdpDocumentAction.Merge;
        const canUndoAction = true;
        const documents = mockIdpDocuments();
        const pages = [documents[0].pages[0], documents[1].pages[0]];
        const targetDocumentId = 'd_cf2';

        service.mergeDocuments(documentAction, canUndoAction, pages, targetDocumentId);

        const action = userActions.pageMerge({ docAction: documentAction, canUndoAction, pages, targetDocumentId });
        expect(storeDispatchSpy).toHaveBeenCalledWith(action);
    });

    it('should dispatch on mark resolved', () => {
        const documentAction = IdpDocumentAction.Resolve;
        const canUndoAction = true;
        const documents = mockIdpDocuments();
        const pages = [documents[0].pages[0], documents[1].pages[0]];

        service.markResolved(documentAction, canUndoAction, pages);

        const action = userActions.documentResolve({ docAction: documentAction, canUndoAction, pages });
        expect(storeDispatchSpy).toHaveBeenCalledWith(action);
    });

    it('should dispatch on mark rejected', () => {
        const documentAction = IdpDocumentAction.Reject;
        const canUndoAction = true;
        const documents = mockIdpDocuments();
        const pages = [documents[0].pages[0], documents[1].pages[0]];
        const rejectReasonId = 'missing_signature';
        const rejectNote = 'Signature is missing! Q_Q';

        service.markRejected(documentAction, canUndoAction, pages, rejectReasonId, rejectNote);

        const action = userActions.documentReject({ docAction: documentAction, canUndoAction, pages, rejectReasonId, rejectNote });
        expect(storeDispatchSpy).toHaveBeenCalledWith(action);
    });

    it('should dispatch on undo action', () => {
        service.undoAction();
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.undoAction());
    });

    it('should dispatch on redo action', () => {
        service.redoAction();
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.redoAction());
    });

    it('should dispatch on copy document id to clipboard', () => {
        service.copyDocumentDetailsToClipboard('d_cf2');
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.copyDocumentDetailsToClipboard({ documentId: 'd_cf2' }));
    });

    it('should dispatch on set document sort option', () => {
        service.setDocumentSortOption(IdpScreenViewSortOption.Classes);
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.sortOptionChange({ option: IdpScreenViewSortOption.Classes }));
    });
});
