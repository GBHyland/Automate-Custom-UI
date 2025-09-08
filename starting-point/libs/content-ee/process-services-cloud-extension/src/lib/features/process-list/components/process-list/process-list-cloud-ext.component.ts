/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, ViewChild, Input, OnChanges, inject, DestroyRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProcessFilterCloudModel, ProcessListCloudComponent, ProcessListCloudSortingModel } from '@alfresco/adf-process-services-cloud';
import { DataColumnComponent, DataColumnListComponent, PaginationComponent, UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { navigateToProcessDetails } from '../../../../store/actions/process-list-cloud.actions';
import { Pagination } from '@alfresco/js-api';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { ExtensionColumnPreset } from '../../../../models/extension-column-preset.interface';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { DynamicColumnComponent } from '@alfresco/adf-extensions';
import { ScrollContainerComponent } from '../../../../components/scroll-container/scroll-container.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    imports: [
        PaginationComponent,
        AsyncPipe,
        NgIf,
        DataColumnComponent,
        DynamicColumnComponent,
        NgForOf,
        DataColumnListComponent,
        ProcessListCloudComponent,
        ScrollContainerComponent,
    ],
    selector: 'apa-process-list-cloud-ext',
    templateUrl: './process-list-cloud-ext.component.html',
    styleUrls: ['./process-list-cloud-ext.component.scss'],
    host: { class: 'apa-process-list-cloud-ext' },
})
export class ProcessListCloudExtComponent implements OnInit, OnChanges {
    private readonly extensions = inject(ProcessServicesCloudExtensionService);
    private readonly userPreferenceService = inject(UserPreferencesService);
    private readonly store = inject(Store);
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild(ProcessListCloudComponent)
    processListCloudComponent: ProcessListCloudComponent;

    @Input()
    currentFilter: ProcessFilterCloudModel;

    defaultPagination: Pagination = new Pagination({
        skipCount: 0,
        maxItems: 25,
    });
    isResizingEnabled = false;
    columns$: Observable<ExtensionColumnPreset[]>;
    sortArray: ProcessListCloudSortingModel[];
    supportedPageSizes$: Observable<any[]>;

    private performAction$ = new Subject<any>();

    ngOnInit() {
        this.setupContextActions();
        this.fetchCloudPaginationPreference();
        this.setSorting(this.currentFilter);

        this.columns$ = this.extensions.getProcessColumns('default');
        this.isResizingEnabled = this.extensions.isColumnResizingEnabled('features.processList.presets.column-resizing');
    }

    ngOnChanges() {
        this.setSorting(this.currentFilter);
    }

    onChangePageSize(event: Pagination): void {
        this.userPreferenceService.paginationSize = event.maxItems;
    }

    navigateToProcessDetails(processInstanceId: string) {
        this.store.dispatch(
            navigateToProcessDetails({
                processInstanceId,
            })
        );
    }

    onShowRowContextMenu(event: any) {
        event.value.actions = [
            {
                data: event.value.row['obj'],
                model: {
                    key: 'process-details',
                    icon: 'open_in_new',
                    title: 'PROCESS_CLOUD_EXTENSION.PROCESS_LIST.ACTIONS.PROCESS_DETAILS',
                    visible: true,
                },
                subject: this.performAction$,
            },
        ];
    }

    setupContextActions() {
        this.performAction$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((action: any) => {
            this.navigateToProcessDetails(action.data.id);
        });
    }

    fetchCloudPaginationPreference() {
        this.supportedPageSizes$ = this.userPreferenceService.select(UserPreferenceValues.SupportedPageSizes).pipe(
            map((supportedPageSizes) => {
                if (typeof supportedPageSizes === 'string') {
                    supportedPageSizes = JSON.parse(supportedPageSizes);
                }
                return supportedPageSizes;
            })
        );
        if (this.processListCloudComponent) {
            this.defaultPagination.maxItems = this.processListCloudComponent.size;
            this.processListCloudComponent.resetPagination();
        }
    }

    setSorting(filter: ProcessFilterCloudModel): void {
        if (!filter) {
            return;
        }

        this.sortArray = [
            new ProcessListCloudSortingModel({
                orderBy: filter.sort,
                direction: filter.order,
            }),
        ];
    }

    reload() {
        this.processListCloudComponent.reload();
    }
}
