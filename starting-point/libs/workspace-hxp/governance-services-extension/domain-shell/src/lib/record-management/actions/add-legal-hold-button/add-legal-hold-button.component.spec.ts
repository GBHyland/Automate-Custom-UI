/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AddLegalHoldButtonComponent } from './add-legal-hold-button.component';
import { ActionContext } from '../../../mocks/record.type';
import { AddLegalHoldButtonService } from './add-legal-hold-button.service';
import { GovernanceLegalHoldManagementService } from '../../../legal-hold-management/services/governance-legal-hold-management.service';
import { of, Subject } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('AddLegalHoldButtonComponent', () => {
    let fixture: ComponentFixture<AddLegalHoldButtonComponent>;
    let component: AddLegalHoldButtonComponent;

    const mockActionContext: ActionContext = {
        records: [{ id: '1' }],
    };

    const executeMock = jest.fn();
    const isAvailableMock = jest.fn(() => of(true));

    const mockAddLegalHoldButtonService = {
        execute: executeMock,
        isAvailable: isAvailableMock,
    };

    const shouldRefreshList$ = new Subject<boolean>();

    const mockGovernanceLegalHoldManagementService = {
        shouldRefreshList$: shouldRefreshList$.asObservable(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AddLegalHoldButtonComponent, NoopTranslateModule, NoopAnimationsModule],
            providers: [
                provideHttpClientTesting(),
                { provide: AddLegalHoldButtonService, useValue: mockAddLegalHoldButtonService },
                { provide: GovernanceLegalHoldManagementService, useValue: mockGovernanceLegalHoldManagementService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AddLegalHoldButtonComponent);
        component = fixture.componentInstance;
        component.actionContext = mockActionContext;
        fixture.detectChanges();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call isAvailable$ observable on init', (done) => {
        component.isAvailable$.subscribe((val) => {
            expect(val).toBe(true);
            expect(isAvailableMock).toHaveBeenCalledWith(mockActionContext.records);
            done();
        });
    });

    it('should call service.execute() when shouldRefreshList$ emits true', fakeAsync(() => {
        shouldRefreshList$.next(true);
        tick();

        expect(executeMock).toHaveBeenCalledWith(mockActionContext);
    }));
});
