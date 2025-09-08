/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TaskAssignmentService } from '../../services/task-assignment.service';
import { UntypedFormControl } from '@angular/forms';
import { TaskAssigneeModel } from '../../models/task-assignee.model';
import { IdentityUserModel, SHARED_IDENTITY_USER_SERVICE_TOKEN, PeopleSmartComponent } from '@alfresco-dbp/shared/identity';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, TranslatePipe, PeopleSmartComponent],
    selector: 'apa-candidates-dialog',
    templateUrl: './task-assignment-dialog.component.html',
    providers: [TaskAssignmentService, { provide: SHARED_IDENTITY_USER_SERVICE_TOKEN, useExisting: TaskAssignmentService }],
})
export class TaskAssignmentDialogComponent implements OnInit {
    isCurrentAssigneeSelected = true;
    preselectedAssignee: IdentityUserModel[] = [];
    searchUserControl = new UntypedFormControl('');
    selectedAssignee: IdentityUserModel;

    constructor(private taskAssignmentService: TaskAssignmentService, @Inject(MAT_DIALOG_DATA) public settings: TaskAssigneeModel) {}

    ngOnInit() {
        if (this.settings.assignee) {
            this.preselectedAssignee = [{ username: this.settings.assignee }];
        }
        this.taskAssignmentService.setApplicationName(this.settings.appName);
        this.taskAssignmentService.setTaskId(this.settings.taskId);
    }

    onSelect(assignee: IdentityUserModel) {
        if (assignee.username.toLocaleLowerCase() !== this.settings.assignee.toLocaleLowerCase()) {
            this.selectedAssignee = assignee;
            this.isCurrentAssigneeSelected = false;
        } else {
            this.isCurrentAssigneeSelected = true;
        }
    }

    onRemove() {
        this.selectedAssignee = null;
    }

    isAssignButtonDisabled(): boolean {
        return this.isCurrentAssigneeSelected || this.searchUserControl.invalid || this.selectedAssignee === null;
    }
}
