/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TooltipCardDirective } from '@alfresco/adf-core';
import { ProcessInstanceCloud } from '@alfresco/adf-process-services-cloud';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ProcessInstanceCloudSubprocess, RelatedProcessContext } from '../../models/related-process.model';

@Component({
    selector: 'apa-related-process',
    standalone: true,
    imports: [CommonModule, TooltipCardDirective, TranslatePipe],
    templateUrl: './related-process.component.html',
    styleUrls: ['./related-process.component.scss'],
    host: { class: 'apa-related-process adf-ellipsis-cell' },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedProcessComponent implements OnInit {
    private translateService = inject(TranslateService);

    @Input()
    context: RelatedProcessContext | undefined;

    processInstance: (ProcessInstanceCloud & { subprocesses?: ProcessInstanceCloudSubprocess[] }) | undefined;

    subprocessTooltipHtmlContent: string | undefined;

    processesTooltipHtmlContent: string | undefined;

    ngOnInit(): void {
        if (this.context?.row?.obj) {
            this.processInstance = this.context.row.obj;
            this.initTooltipContent();
        }
    }

    private getProcessTooltipHtmlContent(): string {
        if (!this.processInstance?.subprocesses?.length) {
            return '';
        }
        const subprocessListItems = this.processInstance.subprocesses.map((subprocess) => {
            return (
                '<li class="apa-process-list-related-process-child">' +
                '<span class="apa-process-list-related-process-child-name">' +
                subprocess.processDefinitionName +
                '</span>' +
                '<span class="apa-process-list-related-process-child-id">' +
                '(id: ' +
                subprocess.id +
                ')' +
                '</span>' +
                '</li>'
            );
        });
        const tooltipHeader =
            '<span class="apa-process-list-related-process-header">' +
            this.translateService.instant('PROCESS_CLOUD_EXTENSION.PROCESS_LIST.TOOLTIP.HEADER') +
            '</span>:<br/>';
        const tooltipContent = `<ul>${subprocessListItems.join('')}</ul>`;
        return `${tooltipHeader}${tooltipContent}`;
    }

    private initTooltipContent() {
        if (this.processInstance?.id) {
            if (this.processInstance.subprocesses?.length) {
                this.processesTooltipHtmlContent = this.getProcessTooltipHtmlContent();
            } else {
                this.subprocessTooltipHtmlContent = this.getSubprocessTooltipHtmlContent();
            }
        }
    }

    private getSubprocessTooltipHtmlContent(): string {
        if (!this.processInstance?.name || !this.processInstance?.parentId) {
            return '';
        }
        return `${this.processInstance.name}<br/>(id: ${this.processInstance.parentId})`;
    }
}
