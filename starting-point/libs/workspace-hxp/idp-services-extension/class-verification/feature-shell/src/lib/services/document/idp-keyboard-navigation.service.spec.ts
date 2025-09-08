/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, QueryList } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { mockIdpConfigClasses } from '../../models/mocked/mocked-classes';
import { mockIdpDocuments } from '../../models/mocked/mocked-documents';
import { IdpConfigClass, IdpDocument } from '../../models/screen-models';
import { mockDocumentEntitiesByIdpDocuments } from '../../store/models/mocked/mocked-documents';
import { selectDocumentActionCompleteEvent } from '../../store/selectors/document.selectors';
import { documentClassAdapter, initialDocumentClassState } from '../../store/states/document-class.state';
import { documentAdapter, initialDocumentState } from '../../store/states/document.state';
import { classVerificationStateName, initialClassVerificationRootState } from '../../store/states/root.state';
import {
    IdpKeyboardNavActionType,
    IdpKeyboardNavActionTypeInternal,
    IdpKeyboardNavClickEvent,
    IdpKeyboardNavContextData,
    IdpKeyboardNavContextType,
    IdpKeyboardNavEvent,
    IdpKeyboardNavigationService,
} from './idp-keyboard-navigation.service';
import { of, Subject } from 'rxjs';
import { IdpDocumentService } from './idp-document.service';
import { IdpShortcutService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { ListItemComponent } from '../../components/list-item/list-item.component';

describe('IdpKeyboardNavigationService', () => {
    let service: IdpKeyboardNavigationService;
    let mockClasses: IdpConfigClass[];
    let mockDocuments: IdpDocument[];
    let idpDocumentServiceMock: jasmine.SpyObj<IdpDocumentService>;
    let idpShortcutServiceMock: jasmine.SpyObj<IdpShortcutService>;

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

        idpDocumentServiceMock = jasmine.createSpyObj<IdpDocumentService>(
            'IdpDocumentService',
            ['toggleExpandDocument', 'getDocumentsForClass', 'togglePreviewedDocument', 'changeFullScreen'],
            {
                selectedDocuments$: of(mockDocuments),
                allDocumentsValid$: of(true),
                allDocuments$: of(mockDocuments),
            }
        );

        idpShortcutServiceMock = jasmine.createSpyObj<IdpShortcutService>('IdpShortcutService', [
            'getShortcutTooltipForAction',
            'getShortcutSummary',
        ]);

        TestBed.configureTestingModule({
            providers: [
                IdpKeyboardNavigationService,
                provideMockStore({
                    initialState: mockState,
                    selectors: [{ selector: selectDocumentActionCompleteEvent, value: undefined }],
                }),
                { provide: IdpDocumentService, useValue: idpDocumentServiceMock },
                { provide: IdpShortcutService, useValue: idpShortcutServiceMock },
                DestroyRef,
            ],
        });

        service = TestBed.inject(IdpKeyboardNavigationService);
    });

    it('should dispatch new action with active item changed type', fakeAsync(() => {
        let actionType: IdpKeyboardNavActionType = IdpKeyboardNavActionTypeInternal.Collapse;
        let currentActiveId = '';

        const expectedId = 'c39abb31-0c41-4a75-84b0-01f6e34c2357';
        const keydownEvent$ = new Subject<IdpKeyboardNavEvent>();
        const clickEvent$ = new Subject<IdpKeyboardNavClickEvent>();
        const items = new QueryList<ListItemComponent>();
        items.reset([
            {
                id: expectedId,
                tabindex: '1',
                isSelected: false,
                index: 0,
                disabled: false,
                focus: () => {},
            } as any,
            {
                id: 'b39abb31-0c41-4a75-84b0-01f6e34c2357',
                tabindex: '0',
                isSelected: false,
                index: 0,
                disabled: false,
                focus: () => {},
            } as any,
        ]);

        const ctx: IdpKeyboardNavContextData = {
            contextId: 'class-id',
            contextType: 'class' as IdpKeyboardNavContextType,
            items: items,
            itemType: 'document' as IdpKeyboardNavContextType,
            keydownEvent$: keydownEvent$,
            clickEvent$: clickEvent$,
            canExpand: true,
            activateItemOnRegister: true,
            multiSelectAllowed: true,
            activeItemIndex: 1,
        };

        const event = {
            itemContext: {
                contextId: expectedId,
                contextType: 'document' as IdpKeyboardNavContextType,
            },
            event: new MouseEvent('mousedown'),
            containerContext: {
                contextId: 'class-id',
                contextType: 'class' as IdpKeyboardNavContextType,
            },
            data: {},
        };

        service.registerContext(ctx);
        service.action$.subscribe((action) => {
            currentActiveId = action.currentActiveInfo.id;
            actionType = action.type;
        });

        clickEvent$.next(event);
        tick(1000);

        expect(actionType).toBe(IdpKeyboardNavActionTypeInternal.ActiveItemChanged);
        expect(currentActiveId).toBe(expectedId);
    }));
});
