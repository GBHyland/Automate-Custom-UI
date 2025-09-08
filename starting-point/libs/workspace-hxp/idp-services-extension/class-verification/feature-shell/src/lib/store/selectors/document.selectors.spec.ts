/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentClassState, documentClassAdapter, initialDocumentClassState } from '../states/document-class.state';
import { mockIdpConfigClasses } from '../../models/mocked/mocked-classes';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';
import {
    selectDocumentsRawState,
    selectAllDocumentClasses,
    selectAllDocuments,
    selectAllSelectedDocuments,
    selectAllSelectedPages,
    selectDocumentsReady,
    selectDocumentsWithIssue,
    selectAllDocumentsValid,
    selectDocumentCountInfo,
    selectSelectedDocumentClass,
    selectClassById,
    selectDocumentsGroupedByClass,
    selectClassMetadata,
    selectDocumentActionCompleteEvent,
    selectPageById,
    selectAllDocumentsForClass,
    selectDocumentEntityStateForIds,
    selectClassIdsWithDocuments,
} from './document.selectors';
import { documentAdapter, DocumentEntity, DocumentState, initialDocumentState } from '../states/document.state';
import { mockDocumentEntities, mockDocumentEntitiesByIdpDocuments } from '../models/mocked/mocked-documents';
import { mockIdpDocuments } from '../../models/mocked/mocked-documents';
import { IdpDocument, IdpDocumentAction, REJECTED_CLASS_ID, UNCLASSIFIED_CLASS_ID } from '../../models/screen-models';
import { createMockStore } from '@ngrx/store/testing';
import { classVerificationStateName, initialClassVerificationRootState } from '../states/root.state';
import { fakeAsync, flush } from '@angular/core/testing';
import { documentFeatureSelector } from './class-verification-root.selectors';

describe('Document Selectors', () => {
    describe('Document Class Selectors', () => {
        it('should select all document classes', () => {
            const mockDocumentClassState: DocumentClassState = {
                ...initialDocumentClassState,
                loadState: IdpLoadState.Loaded,
            };
            const classes = mockIdpConfigClasses();
            documentClassAdapter.setAll(classes, mockDocumentClassState);
            const result = selectAllDocumentClasses.projector(mockDocumentClassState, classes);
            expect(result.length).toEqual(classes.length);
            expect([...result].sort()).toEqual([...classes].sort());
        });

        it('should select empty document classes for IdpLoadState equal NotInitialized', () => {
            const mockDocumentClassState: DocumentClassState = {
                ...initialDocumentClassState,
                loadState: IdpLoadState.NotInitialized,
            };
            const classes = mockIdpConfigClasses();
            documentClassAdapter.setAll(classes, mockDocumentClassState);
            const result = selectAllDocumentClasses.projector(mockDocumentClassState, classes);
            expect(result.length).toEqual(0);
            expect(result).toEqual([]);
        });

        it('should select selected document class', () => {
            const classes = mockIdpConfigClasses();
            classes[2].isSelected = true;
            const result = selectSelectedDocumentClass.projector(classes);
            expect(result).toEqual(classes[2]);
        });

        it('should select class by id', () => {
            const classes = mockIdpConfigClasses();
            const id = classes[2].id;
            const result = selectClassById(id).projector(classes);
            expect(result).toEqual(classes[2]);
        });

        it('should select class metadata', () => {
            let documents = mockIdpDocuments();
            const unclassifiedDocuments = documents.filter((doc) => !doc.class || doc.class.id === UNCLASSIFIED_CLASS_ID);
            const rejectedDocuments = documents.filter((doc) => doc.rejectedReasonId);
            documents = [...unclassifiedDocuments, ...rejectedDocuments];
            const classes = mockIdpConfigClasses();
            const result = selectClassMetadata.projector(selectDocumentsGroupedByClass.projector(documents, classes), classes);
            expect(result.length).toEqual(classes.length);

            const unclassified = result.find((cl) => cl.id === UNCLASSIFIED_CLASS_ID);
            expect(unclassified).toBeDefined();
            expect(unclassified?.isSpecialClass).toBeTrue();
            expect(unclassified?.documentsCount).toEqual(unclassifiedDocuments.length);
            expect(unclassified?.issuesCount).toEqual(unclassifiedDocuments.filter((document) => document.hasIssue).length);
            expect(unclassified?.canExpand).toBeTrue();
            expect(unclassified?.disabled).toBeFalse();

            const rejected = result.find((cl) => cl.id === REJECTED_CLASS_ID);
            expect(rejected).toBeDefined();
            expect(rejected?.documentsCount).toEqual(rejectedDocuments.length);
            expect(rejected?.issuesCount).toEqual(rejectedDocuments.filter((document) => document.hasIssue).length);
            expect(rejected?.canExpand).toBeFalse();
            expect(rejected?.disabled).toBeTrue();

            const payslipsId = classes[2].id;
            const payslips = result.find((cl) => cl.id === payslipsId);
            expect(payslips).toBeDefined();
            expect(payslips?.name).toEqual(classes[2].name);
            expect(payslips?.documentsCount).toEqual(0);
            expect(payslips?.issuesCount).toEqual(0);
            expect(rejected?.canExpand).toBeFalse();
            expect(rejected?.disabled).toBeTrue();
        });
    });

    it('should select all raw documents', fakeAsync(() => {
        const mockDocumentState: DocumentState = {
            ...initialDocumentState,
            loadState: IdpLoadState.Loaded,
        };
        const documentEntities = mockDocumentEntities();

        const store = createMockStore({
            initialState: { [classVerificationStateName]: initialClassVerificationRootState },
            selectors: [
                {
                    selector: documentFeatureSelector,
                    value: documentAdapter.setAll(documentEntities, mockDocumentState),
                },
            ],
        });

        const documents$ = store.select(selectDocumentsRawState);

        let result: DocumentEntity[] = [];
        documents$.subscribe((documents) => {
            result = documents;
        });

        flush();

        expect(result.length).toEqual(documentEntities.length);
        expect([...result].sort()).toEqual([...documentEntities].sort());

        store.resetSelectors();
    }));

    it('should select all documents', () => {
        const documents = mockIdpDocuments().map((document, index) => ({
            ...document,
            isSelected: index < 2,
            isPreviewed: false,
            isDragging: false,
            isExpanded: index === 1,
            pages: document.pages.map((page, pageIndex) => ({
                ...page,
                isSelected: index < 2 && pageIndex < 2,
            })),
        }));

        const mockDocumentState: DocumentState = {
            ...initialDocumentState,
            selectedPageIds: documents.flatMap((document) => document.pages.filter((page) => page.isSelected).map((page) => page.id)),
            expandedDocumentIds: documents.filter((document) => document.isExpanded).map((document) => document.id),
            loadState: IdpLoadState.Loaded,
        };
        const documentEntities = mockDocumentEntitiesByIdpDocuments(documents);
        const deleted = documents.pop() as IdpDocument;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        documentEntities.find((document) => document.id === deleted.id)!.markAsDeleted = true;
        documentAdapter.setAll(documentEntities, mockDocumentState);
        const classes = mockIdpConfigClasses();
        const result = selectAllDocuments.projector(mockDocumentState, documentEntities, classes);
        expect(result.length).toEqual(documents.length);
        expect([...result].sort()).toEqual([...documents].sort());
    });

    it('should select empty documents for IdpLoadState equal NotInitialized', () => {
        const documents = mockIdpDocuments();
        const mockDocumentState: DocumentState = {
            ...initialDocumentState,
            loadState: IdpLoadState.NotInitialized,
        };
        const documentEntities = mockDocumentEntitiesByIdpDocuments(documents);
        documentAdapter.setAll(documentEntities, mockDocumentState);
        const classes = mockIdpConfigClasses();
        const result = selectAllDocuments.projector(mockDocumentState, documentEntities, classes);
        expect(result.length).toEqual(0);
        expect(result).toEqual([]);
    });

    it('should select all selected documents', () => {
        const documents = mockIdpDocuments();
        documents[0].pages[0].isSelected = true;
        documents[0].pages[1].isSelected = true;
        documents[0].isSelected = true;
        documents[1].pages[0].isSelected = true;
        documents[1].isSelected = true;
        const selected = documents.filter((document) => document.isSelected);
        const result = selectAllSelectedDocuments.projector(documents);
        expect(result.length).toEqual(selected.length);
        expect([...result].sort()).toEqual([...selected].sort());
    });

    it('should select all selected pages', () => {
        const documents = mockIdpDocuments();
        documents[0].pages[0].isSelected = true;
        documents[0].pages[1].isSelected = true;
        documents[0].isSelected = true;
        documents[1].pages[0].isSelected = true;
        documents[1].isSelected = true;
        const selected = documents.flatMap((document) => document.pages).filter((page) => page.isSelected);
        const result = selectAllSelectedPages.projector(documents);
        expect(result.length).toEqual(selected.length);
        expect([...result].sort()).toEqual([...selected].sort());
    });

    it('should select documents ready flag correctly', () => {
        expect(selectDocumentsReady.projector({ loadState: IdpLoadState.NotInitialized } as any)).toBeFalse();
        expect(selectDocumentsReady.projector({ loadState: IdpLoadState.Loading } as any)).toBeFalse();
        expect(selectDocumentsReady.projector({ loadState: IdpLoadState.Error } as any)).toBeFalse();
        expect(selectDocumentsReady.projector({ loadState: IdpLoadState.Loaded } as any)).toBeTrue();
    });

    it('should select all documents with issues', () => {
        const documents = mockIdpDocuments();
        const withIssue = documents.filter((document) => document.hasIssue);
        const result = selectDocumentsWithIssue.projector(documents);
        expect(result.length).toEqual(withIssue.length);
        expect([...result].sort()).toEqual([...withIssue].sort());
    });

    it('should select all documents valid correctly', () => {
        const documents = mockIdpDocuments();
        let result = selectAllDocumentsValid.projector(selectDocumentsWithIssue.projector(documents));
        expect(result).toBeFalse();

        const withoutIssue = documents.filter((document) => !document.hasIssue);
        result = selectAllDocumentsValid.projector(selectDocumentsWithIssue.projector(withoutIssue));
        expect(result).toBeTrue();
    });

    it('should select document count information', () => {
        const documents = mockIdpDocuments();
        const withIssue = documents.filter((document) => document.hasIssue);
        const result = selectDocumentCountInfo.projector(documents, withIssue);
        expect(result.totalDocuments).toEqual(documents.length);
        expect(result.totalPages).toEqual(documents.flatMap((document) => document.pages).length);
        expect(result.documentsWithIssues).toEqual(withIssue.length);
    });

    it('should select document action complete event', () => {
        let result = selectDocumentActionCompleteEvent.projector({
            ...initialDocumentState,
            lastAction: {
                action: IdpDocumentAction.ChangeClass,
                isSuccess: true,
                documents: ['d_cf1'],
                pages: [
                    {
                        id: 'cf1_0',
                        documentId: 'd_cf1',
                    },
                ],
            },
        });
        expect(result).toBeDefined();
        expect(result?.action).toEqual(IdpDocumentAction.ChangeClass);
        expect(result?.isSuccess).toEqual(true);
        expect(result?.documents).toEqual(['d_cf1']);
        expect(result?.pages).toEqual([{ id: 'cf1_0', documentId: 'd_cf1' }]);

        result = selectDocumentActionCompleteEvent.projector({
            ...initialDocumentState,
            lastAction: undefined,
        });
        expect(result).toBeUndefined();
    });

    it('should select raw documents for ids', () => {
        const documentEntities = mockDocumentEntities();
        const result = selectDocumentEntityStateForIds([documentEntities[0].id, documentEntities[1].id]).projector(documentEntities);
        expect(result.length).toEqual(2);
        expect(result.sort()).toEqual([documentEntities[0], documentEntities[1]].sort());
    });

    it('should select page by id', () => {
        const documents = mockIdpDocuments();
        const result = selectPageById(documents[1].pages[1].id).projector(documents);
        expect(result).toEqual(documents[1].pages[1]);
    });

    it('should select documents grouped by class', () => {
        const documents = mockIdpDocuments();
        documents[0].rejectedReasonId = 'rr1';
        const classes = mockIdpConfigClasses();
        const result = selectDocumentsGroupedByClass.projector(documents, classes);
        expect(result[classes[2].id].sort()).toEqual(documents.filter((document) => document.class?.id === classes[2].id).sort());
        expect(result[classes[3].id].sort()).toEqual(documents.filter((document) => document.class?.id === classes[3].id).sort());
        expect(result[REJECTED_CLASS_ID]).toContain(documents[0]);
    });

    it('should select documents for class', () => {
        const documents = mockIdpDocuments();
        const classes = mockIdpConfigClasses();
        const grouped = selectDocumentsGroupedByClass.projector(documents, classes);
        let result = selectAllDocumentsForClass(classes[2].id).projector(grouped);
        expect(result).toEqual(documents.filter((document) => document.class?.id === classes[2].id));
        result = selectAllDocumentsForClass('erroneous class').projector(grouped);
        expect(result).toEqual([]);
    });

    it('should select the classes that have documents', () => {
        const documents = mockIdpDocuments();
        const classes = mockIdpConfigClasses();
        const result = selectClassIdsWithDocuments.projector(documents);
        expect(result).toHaveSize(2);
        expect(result).toContain(classes[2].id);
        expect(result).toContain(classes[3].id);
    });
});
