/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, NoopTranslateModule, NoopAuthModule } from '@alfresco/adf-core';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { By } from '@angular/platform-browser';
import { EMPTY, of } from 'rxjs';
import { ProcessTaskListExtComponent } from './process-task-list-ext.component';
import { fakeEditTaskFilter } from '../../../task-list/mock/task-filter.mock';
import { fakeTaskCloudDatatableSchema, fakeTaskCloudList, processDetailsCloudMock } from '../../mock/process-details.mock';
import { mockTaskListPresetColumns } from '../../../task-list/mock/task-list.mock';
import { TaskListCloudComponent, TASK_LIST_CLOUD_TOKEN, ProcessServicesCloudModule } from '@alfresco/adf-process-services-cloud';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { initialProcessServicesCloudState } from '../../../../store/states/state';
import { featureKey } from '../../../../store/reducers/reducer';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MockProvider } from 'ng-mocks';

describe('ProcessTaskListExtComponent', () => {
    let component: ProcessTaskListExtComponent;
    let fixture: ComponentFixture<ProcessTaskListExtComponent>;
    let store: MockStore<any>;

    const processDefinitionCloudState = initialProcessServicesCloudState;
    processDefinitionCloudState.processDefinitions.loaded = true;
    const initialState = {
        [featureKey]: processDefinitionCloudState,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ProcessServicesCloudModule.forRoot(),
                NoopTranslateModule,
                NoopAnimationsModule,
                MatMenuModule,
                NoopAuthModule,
                ProcessTaskListExtComponent,
            ],
            providers: [
                provideMockStore({ initialState }),
                MockProvider(TASK_LIST_CLOUD_TOKEN, {
                    getTaskByRequest: () => of(fakeTaskCloudList),
                }),
                MockProvider(AppConfigService, {
                    config: {
                        ...fakeTaskCloudDatatableSchema,
                        ...fakeEditTaskFilter,
                    },
                    onLoad: EMPTY,
                }),
                MockProvider(ProcessServicesCloudExtensionService, {
                    getTaskListPreset: () => mockTaskListPresetColumns,
                    isColumnResizingEnabled: () => true,
                }),
            ],
        });

        store = TestBed.inject(MockStore);

        fixture = TestBed.createComponent(ProcessTaskListExtComponent);
        component = fixture.componentInstance;
        component.processInstance = processDetailsCloudMock;
        component.columns$ = of(mockTaskListPresetColumns);
        fixture.detectChanges();
    });

    it('should set isResizingEnabled property', () => {
        expect(component.isResizingEnabled).toBeTrue();
    });

    it('should navigate to task details page on click of task list row', async () => {
        const navigateToTaskDetailsSpy = spyOn(store, 'dispatch');
        fixture.detectChanges();
        await fixture.whenStable();

        component.navigateToTaskDetails('mockId');

        fixture.detectChanges();

        const expectedPayload = {
            taskId: 'mockId',
            processName: 'new name',
            type: '[Process Service Cloud Extension] navigate to task details',
        };
        expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(expectedPayload);
    });

    // TODO: https://hyland.atlassian.net/browse/AAE-30630
    // eslint-disable-next-line ban/ban
    xit('Should load task list', async () => {
        fixture.detectChanges();
        await fixture.whenStable();

        const adfProcessList = fixture.debugElement.nativeElement.querySelector('adf-cloud-task-list');
        const adfPagination = fixture.debugElement.nativeElement.querySelector('.adf-pagination');

        expect(adfPagination).toBeDefined();
        expect(adfProcessList).toBeDefined();

        const value1 = fixture.debugElement.query(By.css(`[data-automation-id="text_mockTask"]`));

        expect(value1).not.toBeNull();
        expect(value1.nativeElement.textContent.trim()).toBe('mockTask');
    });

    it('should enable column selector feature', async () => {
        await fixture.whenStable();

        const taskListCloudComponent = fixture.debugElement.query(By.css('adf-cloud-task-list'));
        const taskListCloudComponentInstance = taskListCloudComponent.componentInstance as TaskListCloudComponent;
        expect(taskListCloudComponentInstance.showMainDatatableActions).toBe(true);
    });

    describe('Context Action Menu', () => {
        // TODO: https://hyland.atlassian.net/browse/AAE-30630
        // eslint-disable-next-line ban/ban
        xit('Should be able to display view context action on right click of task', async () => {
            fixture.detectChanges();
            await fixture.whenStable();

            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="text_mockTask"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
            fixture.detectChanges();

            const viewContextAction = document.querySelector(
                `.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`
            );

            expect(viewContextAction.textContent).toContain('open_in_newPROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');
        });

        // TODO: https://hyland.atlassian.net/browse/AAE-30630
        // eslint-disable-next-line ban/ban
        xit('Should be able to dispatch navigateToTaskDetails action on view action click', () => {
            const navigateToTaskDetailsSpy = spyOn(store, 'dispatch');
            const expectedPayload = {
                taskId: 'mockId',
                processName: 'new name',
                type: '[Process Service Cloud Extension] navigate to task details',
            };

            const rowElement = fixture.nativeElement.querySelector('[data-automation-id="text_mockTask"]');
            rowElement.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
            fixture.detectChanges();

            const viewContextAction = document.querySelector(
                `.adf-context-menu [data-automation-id="context-PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS"]`
            );

            expect(viewContextAction.textContent).toContain('open_in_newPROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS');

            viewContextAction.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(navigateToTaskDetailsSpy).toHaveBeenCalledWith(expectedPayload);
        });
    });
});
