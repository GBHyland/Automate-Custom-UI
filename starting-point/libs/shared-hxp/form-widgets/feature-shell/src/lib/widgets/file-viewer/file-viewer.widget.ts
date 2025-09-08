/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { WidgetComponent, FormService, FormFieldModel, ViewerComponent, ErrorWidgetComponent } from '@alfresco/adf-core';
import { Component, DestroyRef, inject, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { FormWidgetService } from '../../services/form-widget/form-widget.service';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { DownloadInfo } from '../../model/download-info.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-file-viewer-widget',
    templateUrl: './file-viewer.widget.html',
    styleUrls: ['./file-viewer.widget.scss'],
    host: {
        '(click)': 'event($event)',
        '(blur)': 'event($event)',
        '(change)': 'event($event)',
        '(focus)': 'event($event)',
        '(focusin)': 'event($event)',
        '(focusout)': 'event($event)',
        '(input)': 'event($event)',
        '(invalid)': 'event($event)',
        '(select)': 'event($event)',
    },
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, ViewerComponent, ErrorWidgetComponent, AsyncPipe, TranslatePipe],
})
export class FileViewerWidgetComponent extends WidgetComponent {
    private formWidgetService: FormWidgetService = inject(FormWidgetService);
    private readonly destroyRef = inject(DestroyRef);

    isRenditionLoading = false;

    file$: Observable<DownloadInfo | null> = this.fieldChanged.pipe(
        mergeMap((field: FormFieldModel) => this.formWidgetService.getViewerContentFromField(field)),
        takeUntilDestroyed(this.destroyRef)
    );

    constructor(formService: FormService) {
        super(formService);

        this.formService?.formDataRefreshed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((formEvent) => {
            const linkedWidgetField = formEvent.form.fieldsCache?.find(
                (cachedField: { id: string }) => cachedField.id === this.field.params['hxpUploadWidget']
            );
            this.field.value = linkedWidgetField?.value;
            this.fieldChanged.emit(this.field);
        });
    }
}
