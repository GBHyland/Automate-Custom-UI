/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessDefinitionCloud } from '@alfresco/adf-process-services-cloud';

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
    selectProcessDefinitionEntities,
    selectProcessDefinitionsLoadingError,
    selectRecentProcessDefinitionKeys,
} from '../../../../store/selectors/process-definitions.selector';
import { FeatureCloudRootState } from '../../../../store/states/state';
import { MatButtonModule } from '@angular/material/button';
import { ProcessListByCategoryComponent } from '../process-list-by-category/process-list-by-category.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    standalone: true,
    imports: [ProcessListByCategoryComponent, MatButtonModule, AsyncPipe, NgIf, MatIconModule, TranslatePipe, MatDialogModule],
    selector: 'apa-start-process-dialog',
    templateUrl: './start-process-dialog.component.html',
    styleUrls: ['./start-process-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class StartProcessDialogComponent implements OnInit {
    allProcesses$: Observable<ProcessDefinitionCloud[]>;
    loadingProcessesError$: Observable<string>;
    recentDefinitionKeys$: Observable<string[]>;

    constructor(private store: Store<FeatureCloudRootState>, private dialog: MatDialogRef<StartProcessDialogComponent>) {}

    ngOnInit(): void {
        this.allProcesses$ = this.store.select(selectProcessDefinitionEntities);
        this.recentDefinitionKeys$ = this.store.select(selectRecentProcessDefinitionKeys);
        this.loadingProcessesError$ = this.store.select(selectProcessDefinitionsLoadingError);
    }

    onSelectProcess(process: { name: string }): void {
        this.dialog.close(process.name);
    }
}
