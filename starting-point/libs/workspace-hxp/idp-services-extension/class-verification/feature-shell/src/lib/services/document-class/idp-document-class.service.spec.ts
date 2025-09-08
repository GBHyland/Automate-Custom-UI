/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IdpDocumentClassService } from './idp-document-class.service';
import { DocumentClassMetadata, IdpConfigClass } from '../../models/screen-models';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { DestroyRef } from '@angular/core';
import { userActions } from '../../store/actions/class-verification.actions';
import { selectViewFilter } from '../../store/selectors/screen.selectors';
import { selectAllDocumentClasses, selectClassMetadata, selectSelectedDocumentClass } from '../../store/selectors/document.selectors';
import { mockIdpConfigClasses } from '../../models/mocked/mocked-classes';

describe('IdpDocumentClassService', () => {
    let service: IdpDocumentClassService;
    let store: MockStore;
    let storeDispatchSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                IdpDocumentClassService,
                provideMockStore({
                    selectors: [
                        { selector: selectAllDocumentClasses, value: [] },
                        { selector: selectSelectedDocumentClass, value: undefined },
                        { selector: selectClassMetadata, value: [] },
                        { selector: selectViewFilter, value: 'All' },
                    ],
                }),
                DestroyRef,
            ],
        });

        service = TestBed.inject(IdpDocumentClassService);
        store = TestBed.inject(MockStore);

        storeDispatchSpy = spyOn(store, 'dispatch');
    });

    afterEach(() => {
        store.resetSelectors();
    });

    it('should initialize all classes', fakeAsync(() => {
        const classes = mockIdpConfigClasses();
        store.overrideSelector(selectAllDocumentClasses, classes);
        store.refreshState();

        let result: IdpConfigClass[] = [];
        service.allClasses$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual(classes);
    }));

    it('should initialize selected class', fakeAsync(() => {
        const classes = mockIdpConfigClasses();
        store.overrideSelector(selectSelectedDocumentClass, classes[2]);
        store.refreshState();

        let result: IdpConfigClass | undefined;
        service.selectedClass$.subscribe((data) => (result = data));

        flush();

        expect(result).toEqual(classes[2]);
    }));

    it('should initialize class metadata', fakeAsync(() => {
        const classes = mockIdpConfigClasses();
        const mockClassesMetadata: DocumentClassMetadata[] = [
            { ...classes[0], documentsCount: 0, issuesCount: 0, canExpand: false, disabled: true },
            { ...classes[2], documentsCount: 10, issuesCount: 3, canExpand: true, disabled: false },
            { ...classes[1], documentsCount: 3, issuesCount: 0, canExpand: true, disabled: false },
            { ...classes[3], documentsCount: 5, issuesCount: 0, canExpand: true, disabled: false },
            { id: 'w9', name: 'W9', isSpecialClass: false, documentsCount: 5, issuesCount: 0, canExpand: true, disabled: false },
        ];
        store.overrideSelector(selectClassMetadata, mockClassesMetadata);
        store.overrideSelector(selectViewFilter, 'All');
        store.refreshState();

        let result: DocumentClassMetadata[] = [];
        service.documentClassMetadata$.subscribe((data) => (result = data));

        flush();

        const expected: DocumentClassMetadata[] = [
            { ...classes[0], documentsCount: 0, issuesCount: 0, canExpand: false, disabled: true },
            { ...classes[1], documentsCount: 3, issuesCount: 0, canExpand: true, disabled: false },
            { ...classes[2], documentsCount: 10, issuesCount: 3, canExpand: true, disabled: false },
            { ...classes[3], documentsCount: 5, issuesCount: 0, canExpand: true, disabled: false },
            { id: 'w9', name: 'W9', isSpecialClass: false, documentsCount: 5, issuesCount: 0, canExpand: true, disabled: false },
        ];
        expect(result).toEqual(expected);
    }));

    it('should initialize class metadata for classes with documents with issues when filter is set to OnlyIssues', fakeAsync(() => {
        const classes = mockIdpConfigClasses();
        const mockClassesMetadata: DocumentClassMetadata[] = [
            { ...classes[0], documentsCount: 0, issuesCount: 0, canExpand: false, disabled: true },
            { ...classes[1], documentsCount: 3, issuesCount: 0, canExpand: true, disabled: false },
            { ...classes[2], documentsCount: 10, issuesCount: 3, canExpand: true, disabled: false },
            { ...classes[3], documentsCount: 5, issuesCount: 0, canExpand: true, disabled: false },
        ];
        store.overrideSelector(selectClassMetadata, mockClassesMetadata);
        store.overrideSelector(selectViewFilter, 'OnlyIssues');
        store.refreshState();

        let result: DocumentClassMetadata[] = [];
        service.documentClassMetadata$.subscribe((data) => (result = data));

        flush();

        const expected: DocumentClassMetadata[] = [{ ...classes[2], documentsCount: 10, issuesCount: 3, canExpand: true, disabled: false }];

        expect(result).toEqual(expected);
    }));

    it('should dispatch on selected class changed', () => {
        const classes = mockIdpConfigClasses();
        store.overrideSelector(selectSelectedDocumentClass, classes[2]);
        store.refreshState();

        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.pageSelect({ pageIds: [] }));
    });

    it('should dispatch on set selected class', () => {
        service.setSelectedClass('payslips');
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.classSelect({ classId: 'payslips' }));
    });

    it('should dispatch on toggle expand class', () => {
        service.toggleExpandClass('payslips');
        expect(storeDispatchSpy).toHaveBeenCalledWith(userActions.classExpandToggle({ classId: 'payslips' }));
    });
});
