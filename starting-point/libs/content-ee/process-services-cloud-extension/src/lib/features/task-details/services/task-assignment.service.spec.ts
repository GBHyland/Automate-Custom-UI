/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { TaskAssignmentService } from './task-assignment.service';
import { of } from 'rxjs';
import { TaskCloudService } from '@alfresco/adf-process-services-cloud';
import { NoopTranslateModule, NoopAuthModule } from '@alfresco/adf-core';

describe('TaskAssignmentService', () => {
    let service: TaskAssignmentService;
    let taskCloudService: TaskCloudService;
    let getTaskCandidateUsersSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAuthModule],
            providers: [TaskAssignmentService],
        });

        service = TestBed.inject(TaskAssignmentService);
        taskCloudService = TestBed.inject(TaskCloudService);
        getTaskCandidateUsersSpy = spyOn(taskCloudService, 'getCandidateUsers').and.returnValue(of(['mock-user-1', 'mock-user-2']));
    });

    it('should be able to fetch candidate users', (done) => {
        service.setApplicationName('mock-app-name');
        service.search('mock-user-1').subscribe(() => {
            expect(getTaskCandidateUsersSpy).toHaveBeenCalled();
            done();
        });
    });

    it('should filter users by given word', (done) => {
        service.setApplicationName('mock-app-name');
        service.search('mock-user-1').subscribe((filteredUsers) => {
            expect(filteredUsers[0].username).toEqual('mock-user-1');
            done();
        });
    });
});
