/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppConfigService, JwtHelperService, OAuth2Service } from '@alfresco/adf-core';
import { map } from 'rxjs/operators';
import { TaskCloudService } from '@alfresco/adf-process-services-cloud';
import { IdentityUserModel, IdentityUserService } from '@alfresco-dbp/shared/identity';

@Injectable()
export class TaskAssignmentService extends IdentityUserService {
    applicationName: string;
    taskId = '';
    contextRoot = '';

    constructor(
        private taskCloudService: TaskCloudService,
        jwtHelperService: JwtHelperService,
        oAuth2Service: OAuth2Service,
        appConfigService: AppConfigService
    ) {
        super(jwtHelperService, oAuth2Service, appConfigService);
    }

    setApplicationName(appName: string) {
        this.applicationName = appName;
    }

    setTaskId(taskId: string) {
        this.taskId = taskId;
    }

    getClientIdByApplicationName(): Observable<string> {
        return of(null);
    }

    search(search?: string): Observable<any[]> {
        return this.taskCloudService
            .getCandidateUsers(this.applicationName, this.taskId)
            .pipe(map((candidates: string[]) => this.transformFilteredCandidates(candidates, search)));
    }

    public transformFilteredCandidates(candidates: string[], search: string): IdentityUserModel[] {
        return candidates
            .filter((candidate: string) => candidate?.toLowerCase().includes(search.toLowerCase()))
            .map((username) => {
                return { username };
            });
    }
}
