/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DataTableModule, NoopTranslateModule, NoopAuthModule } from '@alfresco/adf-core';
import { ExtensionService, ExtensionsModule } from '@alfresco/adf-extensions';
import {
    TaskCloudModule,
    TaskDetailsCloudModel,
    TASK_LIST_CLOUD_TOKEN,
    TASK_LIST_PREFERENCES_SERVICE_TOKEN,
} from '@alfresco/adf-process-services-cloud';
import { Component, Input, OnInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { featureKey } from '../../../../store/reducers/reducer';
import { initialProcessServicesCloudState } from '../../../../store/states/state';
import { fakeTaskCloudList, mockTaskListPresetColumns } from '../../../task-list/mock/task-list.mock';
import { ProcessTaskListExtComponent } from './process-task-list-ext.component';

@Component({
    standalone: true,
    selector: 'apa-custom-task-name-column',
    template: `
        <span data-automation-id="task-name-custom-column">{{ displayValue.name }}</span
        ><br />
        <div>
            <span>Assignee By : </span>
            <span data-automation-id="task-assignee-custom-column">{{ displayValue.assignee }}</span>
        </div>
    `,
    host: {
        class: 'adf-datatable-content-cell adf-datatable-link adf-name-column',
    },
})
export class MockCustomTaskNameComponent implements OnInit {
    @Input()
    context: any;

    displayValue: TaskDetailsCloudModel;

    constructor() {}

    ngOnInit() {
        this.displayValue = this.context?.row?.obj;
    }
}

@Component({
    standalone: true,
    selector: 'apa-custom-task-status-column',
    template: `
        <i data-automation-id="task-status-icon-custom-column" class="far fa-check-circle"></i>
        <span data-automation-id="task-status-custom-column">{{ displayValue.status }}</span>
    `,
    host: {
        class: 'adf-datatable-content-cell adf-datatable-link adf-name-column',
    },
})
export class MockCustomTaskStatusComponent implements OnInit {
    @Input()
    context: any;

    displayValue: TaskDetailsCloudModel;

    constructor() {}

    ngOnInit() {
        this.displayValue = this.context?.row?.obj;
    }
}

describe('ProcessTaskListExtComponent with Custom Columns', () => {
    let fixture: ComponentFixture<ProcessTaskListExtComponent>;
    let processServicesCloudExtensionService: ProcessServicesCloudExtensionService;

    const processDefinitionCloudState = initialProcessServicesCloudState;
    processDefinitionCloudState.processDefinitions.loaded = true;
    const initialState = {
        [featureKey]: processDefinitionCloudState,
    };

    const mockService = jasmine.createSpyObj<any>('ProcessTaskListCloudService', ['getTaskByRequest']);

    const preferencesService = jasmine.createSpyObj('preferencesService', {
        getPreferences: of({}),
        updatePreference: of({}),
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopTranslateModule,
                NoopAuthModule,
                TaskCloudModule,
                DataTableModule,
                ExtensionsModule,
                ProcessTaskListExtComponent,
                MockCustomTaskStatusComponent,
                MockCustomTaskNameComponent,
            ],
            providers: [
                provideMockStore({ initialState }),
                { provide: TASK_LIST_CLOUD_TOKEN, useValue: mockService },
                {
                    provide: TASK_LIST_PREFERENCES_SERVICE_TOKEN,
                    useValue: preferencesService,
                },
            ],
        });
        TestBed.overrideProvider(TASK_LIST_CLOUD_TOKEN, { useValue: mockService });

        mockService.getTaskByRequest.and.returnValue(of(fakeTaskCloudList));
        processServicesCloudExtensionService = TestBed.inject(ProcessServicesCloudExtensionService);
        spyOn(processServicesCloudExtensionService, 'getTaskListPreset').and.returnValue(<any>mockTaskListPresetColumns);

        TestBed.inject(ExtensionService).setComponents({
            'app.taskList.columns.name': MockCustomTaskNameComponent,
            'app.taskList.columns.status': MockCustomTaskStatusComponent,
        });

        fixture = TestBed.createComponent(ProcessTaskListExtComponent);
        fixture.detectChanges();
    });

    it('Should fetch task list and display custom columns preset from extension', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const adfTaskList = fixture.debugElement.queryAll(By.css('.adf-datatable-cell-header-content'));
        expect(adfTaskList).not.toBeNull();
        expect(adfTaskList[0].nativeElement.textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.NAME');
        expect(adfTaskList[1].nativeElement.textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.STATUS');
        expect(adfTaskList[2].nativeElement.textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.ASSIGNEE');
        expect(adfTaskList[3].nativeElement.textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.CREATED_DATE');
        expect(adfTaskList[4].nativeElement.textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.LAST_MODIFIED');
        expect(adfTaskList[5].nativeElement.textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.DUE_DATE');
        expect(adfTaskList[6].nativeElement.textContent.trim()).toEqual('ADF_CLOUD_TASK_LIST.PROPERTIES.PRIORITY');
    });

    it('Should task list display custom template extension columns', () => {
        const customTaskNameTemplateSelector = fixture.debugElement.query(By.css('apa-custom-task-name-column'));
        const customTaskNameColumn = fixture.debugElement.query(By.css(`[data-automation-id="task-name-custom-column"]`));
        const customTaskAssigneeElement = fixture.debugElement.query(By.css(`[data-automation-id="task-assignee-custom-column"]`));

        expect(customTaskNameTemplateSelector).not.toBeNull();
        expect(customTaskNameColumn).not.toBeNull();
        expect(customTaskAssigneeElement).not.toBeNull();

        expect(customTaskNameColumn.nativeElement.innerText.trim()).toBe('nameFake1');
        expect(customTaskAssigneeElement.nativeElement.innerText.trim()).toBe('mock-assignee');

        const customTaskStatusTemplateSelector = fixture.debugElement.query(By.css('apa-custom-task-status-column'));
        const customTaskStatusColumn = fixture.debugElement.query(By.css(`[data-automation-id="task-status-custom-column"]`));
        const customTaskStatusIconElement = fixture.debugElement.query(By.css(`[data-automation-id="task-status-icon-custom-column"]`));

        expect(customTaskStatusTemplateSelector).not.toBeNull();
        expect(customTaskStatusColumn).not.toBeNull();
        expect(customTaskStatusIconElement).not.toBeNull();

        expect(customTaskStatusColumn.nativeElement.innerText.trim()).toBe('ASSIGNED');
    });
});
