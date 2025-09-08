/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { AfterViewInit, Component, Inject, ViewEncapsulation } from '@angular/core';
import {
    FormModel,
    FormService,
    ThumbnailService,
    UploadWidgetContentLinkModel,
    WidgetComponent,
    ErrorWidgetComponent,
    ViewerComponent,
} from '@alfresco/adf-core';
import { Observable, of, Subject } from 'rxjs';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { AttachFileDialogData, SelectionMode } from './models/attach-file-dialog-data.interface';
import { FileSourceServiceId } from './models/file-source-service-id';
import { SharedAttachFileDialogService } from '@hxp/shared-hxp/services';
import { map, mergeMap, shareReplay, startWith, take } from 'rxjs/operators';
import { FormWidgetService } from '../../services/form-widget/form-widget.service';
import { DOCUMENT_SERVICE, SharedDocumentService } from '@alfresco/adf-hx-content-services/services';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { STUDIO_HXP } from '@features';
import { TranslatePipe } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, AsyncPipe } from '@angular/common';
import { DownloadInfo } from '../../model/download-info.model';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-attach-file-widget',
    templateUrl: './attach-file.widget.html',
    styleUrls: ['./attach-file.widget.scss'],
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
    imports: [
        NgIf,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        ErrorWidgetComponent,
        ViewerComponent,
        AsyncPipe,
        TranslatePipe,
    ],
})
export class AttachFileWidgetComponent extends WidgetComponent implements AfterViewInit {
    private static readonly VARIABLES_PREFIX = 'variables.';

    selectedDocument: Document | null = null;
    lastSentToViewers: Document | null = null;
    viewingFile: DownloadInfo | null = null;
    attachedFiles$: Observable<Document[]>;
    hasAttachedFiles$: Observable<boolean>;
    isAttachButtonDisabled$: Observable<boolean>;

    private isDefaultFolderFeatureFlagOn = false;

    protected readonly applicationChromeFeatureFlag = ADF_HX_CONTENT_SERVICES_INTERNAL.CIC_WORKSPACE_SATORI_APPLICATION_CHROME;

    constructor(
        formService: FormService,
        private dialogService: SharedAttachFileDialogService,
        private thumbnailService: ThumbnailService,
        private formWidgetService: FormWidgetService,
        @Inject(DOCUMENT_SERVICE) private documentService: SharedDocumentService,
        @Inject(FeaturesServiceToken) protected readonly featuresService: IFeaturesService
    ) {
        super(formService);

        this.featuresService
            .isOn$(STUDIO_HXP.ATTACH_FILE_WIDGET_DEFAULT_FOLDER)
            .pipe(takeUntilDestroyed())
            .subscribe((isFeatureFlagOn) => (this.isDefaultFolderFeatureFlagOn = isFeatureFlagOn));

        this.attachedFiles$ = this.fieldChanged.pipe(
            startWith(this.field),
            mergeMap((field) => this.formWidgetService.getDocumentsFromField(field)),
            shareReplay(1)
        );
        this.hasAttachedFiles$ = this.attachedFiles$.pipe(map((files) => files.length > 0));
        this.isAttachButtonDisabled$ = this.hasAttachedFiles$.pipe(map((hasAttachedFiles) => !this.field.params['multiple'] && hasAttachedFiles));
    }

    showActionsMenu(): any {
        const menuOptions = this.field.params.menuOptions;
        return menuOptions?.show || menuOptions?.download || menuOptions?.remove;
    }

    clearFileData(): void {
        this.viewingFile = null;
    }

    onViewOptionClicked(file: Document): void {
        this.formWidgetService
            .getViewerContentFromDocument(file)
            .pipe(take(1))
            .subscribe((fileData) => {
                this.viewingFile = fileData;
            });
    }

    onRemoveOptionClicked(file: Document): void {
        if (this.isSelected(file)) {
            this.selectedDocument = null;
        }
        this.field.value = this.field.value.filter((f: Document) => f.sys_id !== file.sys_id);
        this.fieldChanged.emit(this.field);
        this.notifySubscribedViewers();
    }

    onDownloadClicked(files: Document[]): void {
        this.dialogService.downloadDocuments(files);
    }

    onRowClicked(file: Document): void {
        if (this.isSelected(file)) {
            this.selectedDocument = null;
        } else {
            const index = this.field.value.findIndex((f: Document) => f.sys_id === file.sys_id);
            this.field.value.splice(index, 1);
            this.field.value.unshift(file);
            this.notifySubscribedViewers();
            this.field.value.splice(0, 1);
            this.field.value.splice(index, 0, file);

            this.selectedDocument = file;
        }
    }

    getFileIcon(document: Document): string {
        return this.thumbnailService.getMimeTypeIcon(document['sysfile_blob']?.['mimeType']);
    }

    isBlobPresent(document: Document): boolean {
        return !document['sysfile_blob'];
    }

    async openSelectDialog(): Promise<void> {
        this.openUploadFileDialog().subscribe((attachedFiles: Document[]) => {
            if (!this.field.value || !Array.isArray(this.field.value)) {
                this.field.value = attachedFiles;
            }

            for (const attachedFile of attachedFiles) {
                const index = this.field.value.findIndex((file: Document) => file.sys_id === attachedFile.sys_id);
                if (index === -1) {
                    this.addFileToFieldValue(attachedFile);
                } else {
                    this.replaceFileInFieldValue(index, attachedFile);
                }
            }

            this.notifySubscribedViewers();
            this.fieldChanged.emit(this.field);
        });
    }

    private openUploadFileDialog(): Subject<Document[]> {
        const selectionSubject$ = new Subject<Document[]>();

        const data: AttachFileDialogData = {
            selectionMode: this.field.params['multiple'] ? SelectionMode.multiple : SelectionMode.single,
            selectionSubject$,
            isLocalUploadAvailable: false,
            isContentUploadAvailable: true,
            defaultDocumentPath$: of(),
        };

        const serviceId = this.field?.params?.fileSource?.serviceId;
        const isLocal = serviceId === FileSourceServiceId.HXP_LOCAL;
        const isContent = serviceId === FileSourceServiceId.HXP_CONTENT;
        const isAllFileSources = serviceId === FileSourceServiceId.ALL_FILE_SOURCES;

        const path = this.field?.params?.fileSource?.destinationFolderPath?.value;
        let path$ = of(path);

        if (this.isDefaultFolderFeatureFlagOn) {
            if (path) {
                if (this.field?.params?.fileSource?.destinationFolderPath?.type === 'string-variable') {
                    path$ = of(this.getVariableValue(this.field.form, path));
                } else if (this.field?.params?.fileSource?.destinationFolderPath?.type === 'content-variable') {
                    const contentReference = this.formWidgetService.createContentReference(this.getVariableValue(this.field.form, path));
                    path$ = (
                        contentReference.type === 'path'
                            ? this.documentService.getDocumentByPath(contentReference.reference!)
                            : this.documentService.getDocumentById(contentReference.reference!)
                    ).pipe(
                        take(1),
                        map((doc) => doc.sys_path)
                    );
                }
            }

            data.defaultDocumentPath$ = path$;
            data.isLocalUploadAvailable = isLocal || isAllFileSources;
            data.isContentUploadAvailable = isContent || isAllFileSources;
        } else {
            if ((isLocal || isAllFileSources) && path) {
                data.defaultDocumentPath$ = path$;
                data.isLocalUploadAvailable = true;
            }
        }

        this.dialogService.openDialog(data);

        return selectionSubject$;
    }

    private getVariableValue(form: FormModel, variableName: string): any {
        const variable = form.variables.find((existingVar) => existingVar.name === variableName);
        if (!variable) {
            return null;
        }
        if (form.processVariables && form.processVariables.length > 0) {
            const processVar = form.processVariables.find(
                (processVariable) => processVariable.name === AttachFileWidgetComponent.VARIABLES_PREFIX + variableName
            );
            if (processVar) {
                return processVar.value;
            }
        }
        return variable.value;
    }

    private isSelected(document: Document): boolean {
        return this.selectedDocument ? this.selectedDocument.sys_id === document.sys_id : false;
    }

    private notifySubscribedViewers(): void {
        if (this.lastSentToViewers?.sys_id !== this.field.value[0]?.sys_id) {
            this.lastSentToViewers = this.field.value[0];
            const linkModel = new UploadWidgetContentLinkModel(null, this.field.id, { linkedWidgetType: 'hxpUploadWidget' });
            this.formService?.formContentClicked.next(linkModel);
        }
    }

    private replaceFileInFieldValue(index: number, attachedFile: Document): void {
        this.field.value[index] = attachedFile;
    }

    private addFileToFieldValue(attachedFile: Document): void {
        this.field.value.push(attachedFile);
    }
}
