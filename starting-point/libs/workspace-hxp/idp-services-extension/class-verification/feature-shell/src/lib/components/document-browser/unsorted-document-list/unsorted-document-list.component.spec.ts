/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IdpDocumentToolbarService } from '../../../services/document/idp-document-toolbar.service';
import { IdpDocumentService } from '../../../services/document/idp-document.service';
import { of, Subject } from 'rxjs';
import { mockIdpDocuments } from '../../../models/mocked/mocked-documents';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { IdpKeyboardNavAction, IdpKeyboardNavigationService } from '../../../services/document/idp-keyboard-navigation.service';
import { IdpDocumentMultiselectService } from '../../../services/document/idp-document-multiselect.service';
import { IdpNavSelectionType } from '../../../models/common-models';
import { UnsortedDocumentListComponent } from './unsorted-document-list.component';
import { IdpDocument, IdpDocumentPage } from '../../../models/screen-models';
import { IdpDocumentDragDropService } from '../../../services/document/idp-drag-drop.service';
import { IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN, IdpShortcut, IdpShortcutService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { InjectionToken } from '@angular/core';
import { IdpDocumentClassService } from '../../../services/document-class/idp-document-class.service';

describe('UnsortedDocumentListViewComponent', () => {
    let component: UnsortedDocumentListComponent;
    let fixture: ComponentFixture<UnsortedDocumentListComponent>;
    let idpDocumentToolbarServiceMock: jasmine.SpyObj<IdpDocumentToolbarService>;
    let idpDocumentServiceMock: jasmine.SpyObj<IdpDocumentService>;
    let idpDocumentMultiselectServiceMock: any;
    let idpKeyboardNavigationServiceMock: jasmine.SpyObj<IdpKeyboardNavigationService>;
    let idpDocumentClassServiceMock: jasmine.SpyObj<IdpDocumentClassService>;
    let idpDocumentDragDropServiceMock: any;
    let allDocumentsForSelectedClass: IdpDocument[];
    let allPagesForSelectedClass: IdpDocumentPage[];
    let selectedPages: IdpDocumentPage[];
    let actionSubject$: Subject<IdpKeyboardNavAction>;

    beforeEach(() => {
        const mockedDocuments = mockIdpDocuments();
        allDocumentsForSelectedClass = [mockedDocuments[1], mockedDocuments[2]];
        for (const page of allDocumentsForSelectedClass[0].pages) {
            page.isSelected = true;
        }
        allDocumentsForSelectedClass[0].isExpanded = true;
        allDocumentsForSelectedClass[1].isExpanded = false;

        allPagesForSelectedClass = allDocumentsForSelectedClass.flatMap((d) => d.pages);
        selectedPages = allDocumentsForSelectedClass[0].pages;

        actionSubject$ = new Subject<IdpKeyboardNavAction>();

        const mockDocGroups: Record<string, IdpDocument[]> = {
            class1: [mockedDocuments[0], mockedDocuments[1]],
            class2: [mockedDocuments[2], mockedDocuments[3]],
        };

        idpDocumentToolbarServiceMock = jasmine.createSpyObj<IdpDocumentToolbarService>(
            'IdpDocumentToolbarService',
            ['handleMovePageAndCreateNewDoc', 'handlePageSplit', 'handlePageSplit', 'handleMovePages'],
            {
                documentToolBarItems$: of([]),
            }
        );

        idpDocumentServiceMock = jasmine.createSpyObj<IdpDocumentService>(
            'IdpDocumentService',
            ['toggleExpandDocument', 'getDocumentsForClass', 'togglePreviewedDocument', 'updatePagesRotation', 'getAllDocumentsGroupedByClass'],
            {
                selectedDocuments$: of(allDocumentsForSelectedClass),
                allPagesForSelectedClass$: of(allPagesForSelectedClass),
                selectedPages$: of(selectedPages),
                allDocumentsForSelectedClass$: of(allDocumentsForSelectedClass),
                documentViewFilter$: of('OnlyIssues'),
                allDocuments$: of(mockedDocuments),
            }
        );
        idpDocumentServiceMock.getDocumentsForClass.and.returnValue(of(allDocumentsForSelectedClass));
        idpDocumentServiceMock.getAllDocumentsGroupedByClass.and.returnValue(of(mockDocGroups));

        idpDocumentMultiselectServiceMock = {
            clearSelection: jasmine.createSpy('clearSelection').and.returnValue(of([])),
            selectAll: jasmine.createSpy('selectAll').and.returnValue(of([])),
            documentSelected: jasmine.createSpy('documentSelected'),
            pageSelected: jasmine
                .createSpy('pageSelected')
                .and.callFake((pageId: string, mode: IdpNavSelectionType, toggle = false) => ({ pageId, mode, toggle })),
        };

        idpDocumentDragDropServiceMock = {
            addDropList: jasmine.createSpy('addDropList').and.callThrough(),
            removeDropList: jasmine.createSpy('removeDropList').and.callThrough(),
            lists$: of([]),
            draggingObject$: of({}),
            isDragging$: of(false),
            setDraggingState: jasmine.createSpy('setDraggingState'),
            setDraggingTarget: jasmine.createSpy('setDraggingTarget'),
        };

        idpKeyboardNavigationServiceMock = jasmine.createSpyObj<IdpKeyboardNavigationService>(
            'IdpKeyboardNavigationService',
            ['registerContext', 'unregisterContext'],
            {
                action$: actionSubject$.asObservable(),
            }
        );

        idpDocumentClassServiceMock = jasmine.createSpyObj<IdpDocumentClassService>('IdpDocumentClassService', ['setSelectedClass'], {
            selectedClass$: of(mockedDocuments[0].class),
        });

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, UnsortedDocumentListComponent],
            providers: [
                { provide: IdpDocumentDragDropService, useValue: idpDocumentDragDropServiceMock },
                { provide: IdpDocumentMultiselectService, useValue: idpDocumentMultiselectServiceMock },
                { provide: IdpKeyboardNavigationService, useValue: idpKeyboardNavigationServiceMock },
                { provide: IdpDocumentToolbarService, useValue: idpDocumentToolbarServiceMock },
                { provide: IdpDocumentService, useValue: idpDocumentServiceMock },
                { provide: IdpShortcutService, useClass: IdpShortcutService },
                { provide: IdpDocumentClassService, useValue: idpDocumentClassServiceMock },
                { provide: IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN, useValue: new InjectionToken<IdpShortcut[]>('IDP_SCREEN_SHORTCUTS') },
            ],
        });

        fixture = TestBed.createComponent(UnsortedDocumentListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should filter documents by OnlyIssues filter', fakeAsync(() => {
        let result: any[] = [];
        component.documents$.subscribe((docs) => (result = docs));
        tick();

        expect(result.length).toBe(2);
        expect(result[0].hasIssue).toBeTrue();
        expect(result[1].hasIssue).toBeTrue();
    }));

    it('should set selected document count', fakeAsync(() => {
        let result = 0;
        component.selectedDocumentsCount$.subscribe((count) => (result = count));
        tick();

        expect(result).toBe(allDocumentsForSelectedClass.length);
    }));
});
