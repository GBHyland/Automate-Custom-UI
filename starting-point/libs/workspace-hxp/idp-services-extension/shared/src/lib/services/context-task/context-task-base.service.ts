/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { RejectReason } from '../../models/contracts/task-input';
import { Observable } from 'rxjs';
import { IdpTaskActions, IdpTaskInfoBase } from '../../models/common-models';
import { TaskContext } from '../../models/api-models/task-context';

@Injectable()
export abstract class IdpContextTaskBaseService {
    abstract readonly taskInfo$: Observable<IdpTaskInfoBase>;
    abstract readonly taskAction$: Observable<{ action: IdpTaskActions; openNextTask?: boolean }>;
    abstract readonly screenReady$: Observable<boolean>;
    abstract readonly taskCanSave$: Observable<boolean>;
    abstract readonly taskCanComplete$: Observable<boolean>;
    abstract readonly taskCanUnclaim$: Observable<boolean>;
    abstract readonly rejectReasons$: Observable<RejectReason[]>;

    abstract initialize(taskContext: TaskContext): void;
    abstract destroy(): void;
    abstract saveTask(): void;
    abstract completeTask(): void;
    abstract cancelTask(): void;
    abstract claimTask(taskContext: TaskContext): void;
    abstract unclaimTask(): void;
}
