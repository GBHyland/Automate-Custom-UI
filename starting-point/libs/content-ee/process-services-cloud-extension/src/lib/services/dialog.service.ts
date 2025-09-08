/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TaskAssignmentDialogComponent } from '../features/task-details/components/task-assignment-dialog/task-assignment-dialog.component';
import { ConfirmationDialogComponent } from '../components/dialog/confirmation-dialog.component';
import { TaskAssigneeModel } from '../features/task-details/models/task-assignee.model';
import { WaitingScreenDialogComponent } from '../features/task-details/components/waiting-screen-dialog/waiting-screen-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    constructor(private dialog: MatDialog) {}

    openTaskAssignmentDialog(settings: TaskAssigneeModel): MatDialogRef<TaskAssignmentDialogComponent> {
        return this.dialog.open(TaskAssignmentDialogComponent, {
            data: <TaskAssigneeModel>{
                appName: settings.appName,
                taskId: settings.taskId,
                assignee: settings.assignee,
            },
            minWidth: '40%',
        });
    }

    openConfirmDialogBeforeProcessCancelling(): MatDialogRef<ConfirmationDialogComponent> {
        return this.dialog.open(ConfirmationDialogComponent, {
            minWidth: '40%',
            data: {
                title: 'PROCESS_CLOUD_EXTENSION.DIALOG.PROCESS.TITLE',
                message: 'PROCESS_CLOUD_EXTENSION.DIALOG.PROCESS.MESSAGE',
                action: 'PROCESS_CLOUD_EXTENSION.DIALOG.CONFIRM',
            },
        });
    }

    openNextUserTaskWaitingScreen(): MatDialogRef<WaitingScreenDialogComponent> {
        return this.dialog.open(WaitingScreenDialogComponent, {
            minWidth: '40%',
            disableClose: true,
        });
    }
}
