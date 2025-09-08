/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { EMPTY, of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { By } from '@angular/platform-browser';
import { SidenavCloudExtComponent } from './sidenav-cloud-ext.component';
import { selectProcessManagementFilter } from '../../store/selectors/extension.selectors';
import { NoopTranslateModule, IconComponent } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockComponent, MockProvider } from 'ng-mocks';
import { ProcessFilterCloudService, TaskFilterCloudService } from '@alfresco/adf-process-services-cloud';

describe('SidenavCloudExtComponent', () => {
    let component: SidenavCloudExtComponent;
    let fixture: ComponentFixture<SidenavCloudExtComponent>;
    let store: Store<any>;

    const mockFilter = {
        id: 'mock-id',
        name: 'name',
        key: 'fake-filter',
        index: 1,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAnimationsModule, MatMenuModule, SidenavCloudExtComponent, MockComponent(IconComponent)],
            providers: [
                MockProvider(TaskFilterCloudService, {
                    getTaskListFilters: () => of([]),
                    getTaskNotificationSubscription: () => of([]),
                    filterKeyToBeRefreshed$: EMPTY,
                }),
                MockProvider(ProcessFilterCloudService, {
                    getProcessFilters: () => of([]),
                    getProcessNotificationSubscription: () => of([]),
                    filterKeyToBeRefreshed$: EMPTY,
                }),
                {
                    provide: Store,
                    useValue: {
                        select: (selector) => {
                            return selector === selectProcessManagementFilter ? of([]) : of({});
                        },
                        dispatch: () => {},
                    },
                },
            ],
        });

        fixture = TestBed.createComponent(SidenavCloudExtComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
    });

    afterEach(() => fixture.destroy());

    it('should mark process management section as active when a filter is selected', () => {
        spyOn(store, 'select').and.returnValue(of(mockFilter));
        component.data = { state: 'expanded' };
        fixture.detectChanges();

        const processManagementButton = fixture.debugElement.query(By.css('[data-automation-id="apa-process-cloud-management-button"'));

        expect(processManagementButton.classes['apa-action-button--active']).toBe(true);
    });
});
