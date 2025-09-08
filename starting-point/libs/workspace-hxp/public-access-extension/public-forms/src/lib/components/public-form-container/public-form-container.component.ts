/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { PublicFormComponent } from '../public-form/public-form.component';
import { PUBLIC_PROCESS_CONFIG, ProcessConfig } from '../../tokens/process-id.token';
import { PublicFormContainerService } from './public-form-container.service';

const processConfig: ProcessConfig = {
    id: '',
};

@Component({
    standalone: true,
    selector: 'hxp-public-form-container',
    templateUrl: './public-form-container.component.html',
    imports: [PublicFormComponent],
    providers: [{ provide: PUBLIC_PROCESS_CONFIG, useValue: processConfig }],
})
export class PublicFormContainerComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly publicFormContainerService = inject(PublicFormContainerService);

    processId: string | null = null;

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            const processId = params.get('processId');
            const processKey = params.get('processKey');

            if (processId) {
                processConfig.id = processId;
                this.processId = processId;
            } else if (processKey) {
                this.publicFormContainerService
                    .fetchLatestProcessDefinition(processKey)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((processDefinition) => {
                        const processDefinitionId = processDefinition.id;
                        processConfig.id = processDefinitionId;
                        this.processId = processDefinitionId;
                    });
            }
        });
    }
}
