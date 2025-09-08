/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ViewerComponent, ViewerSidebarComponent, ViewerToolbarComponent, ViewUtilService } from '@alfresco/adf-core';
import {
    BlobDownloadService,
    DEFAULT_RENDITION_ID,
    hasRenditionBlob,
    pollWhile,
    RenditionsService,
    RenditionStatus,
} from '@alfresco/adf-hx-content-services/services';
import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import {
    Component,
    ContentChild,
    DestroyRef,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogModule } from '@angular/material/dialog';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { TranslatePipe } from '@ngx-translate/core';
import { defer, iif, Observable, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

/**
 * Component that display the content of a Document.
 *
 * To use the `HxpUiDocumentViewerComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { HxpUiDocumentViewerComponent } from '@alfresco/adf-hx-content-services/ui';
 * @NgModule({
 *     imports: [
 *         HxpUiDocumentViewerComponent,
 *         ...
 *     ],
 *    [...]
 * })
 * export class AppModule {}
 * ```
 *
 * Then use it in your Angular template as shown in the example below:
 *
 * @example
 *  <hxp-ui-document-viewer
 *      [document]="document"
 *      [showRightSidebar]="showRightSidebar"
 *      [fullScreen]="fullScreen"
 *      (closeViewer)="onClose()">
 *          <ng-template #toolbar>
 *              <div>Your optional custom toolbar</div>
 *          </ng-template>
 *          <ng-template #sidebar>
 *              <div>Your optional custom sidebar</div>
 *          </ng-template>
 *  </hxp-ui-document-viewer>
 */
@Component({
    selector: 'hxp-ui-document-viewer',
    templateUrl: './document-viewer.component.html',
    styleUrls: ['./document-viewer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, ViewerComponent, ViewerToolbarComponent, ViewerSidebarComponent, AsyncPipe, TranslatePipe, NgTemplateOutlet, MatDialogModule],
})
export class HxpUiDocumentViewerComponent implements OnChanges {
    private destroyRef = inject(DestroyRef);
    /**
     * Input property that accepts a `Document` object.
     * This property is used to pass the document to be viewed by the component.
     * @type {Document}
     * @required
     */
    @Input()
    document!: Document;

    /**
     * A boolean input property that determines whether the right sidebar is displayed.
     * When set to `true`, the right sidebar will be shown. When set to `false`, the right sidebar will be hidden.
     * @type {boolean}
     * @default false
     */
    @Input()
    showRightSidebar = false;

    /**
     * A boolean input property that trigger the browser native full-screen mode.
     * The default value is `false`. To trigger the full-screen mode, set the property to `true`.
     * Setting it back to `false` will not exit the full-screen mode,
     * you have to manually set it to `false` when the `closeViewer` event is emitted
     *
     * @type {boolean}
     * @default false
     */
    @Input()
    fullScreen = false;

    /**
     * Event emitter that notifies when the document has been closed.
     *
     * @event closeViewer
     */
    @Output()
    closeViewer: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('viewer') protected viewer!: ViewerComponent<Document>;

    @ContentChild('toolbar', { static: false })
    protected toolbarTemplateRef: TemplateRef<any> | null = null;
    @ContentChild('sidebar', { static: false })
    protected sidebarTemplateRef: TemplateRef<any> | null = null;

    protected blobFile$!: Observable<Blob>;

    private isRenditionLoading = false;
    private isEnteredFullScreenMode = false;

    constructor(
        private blobDownloadService: BlobDownloadService,
        private renditionsService: RenditionsService,
        private viewUtilService: ViewUtilService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['document']) {
            this.fetchBlob();
        }
        if (this.viewer) {
            if (changes['showRightSidebar']) {
                this.viewer.showRightSidebar = this.showRightSidebar;
            }
            if (changes['fullScreen']) {
                this.manageFullScreenMode(this.fullScreen);
            }
        }
    }

    protected onClose(): void {
        this.isEnteredFullScreenMode = false;
        this.closeViewer.emit();
    }

    private manageFullScreenMode(shouldEnterFullScreen: boolean) {
        if (shouldEnterFullScreen && !this.isEnteredFullScreenMode) {
            try {
                this.viewer.enterFullScreen();
                this.isEnteredFullScreenMode = true;
            } catch {
                console.warn('Unable to enter full-screen mode');
            }
        } else if (!shouldEnterFullScreen && this.isEnteredFullScreenMode) {
            console.warn(`Not allowed to exit full-screen mode by updating fullScreen input to false, as it is handled by the native browser.
                Remember to set the fullScreen property back to false when the closeViewer event is emitted.`);
        }
    }

    private fetchBlob() {
        if (this.document) {
            const documentMimeType = this.document['sysfile_blob']?.['mimeType'];

            const isMimeTypeSupported = this.viewUtilService.getViewerTypeByMimeType(documentMimeType) !== 'unknown';

            if (isMimeTypeSupported) {
                this.blobFile$ = this.blobDownloadService.downloadBlob(this.document.sys_id as string).pipe(catchError(() => of(new Blob())));
            } else {
                this.isRenditionLoading = true;
                this.renditionsService
                    .listRenditions(this.document.sys_id as string)
                    .pipe(
                        switchMap((renditions = []) =>
                            iif(() => renditions.length === 0, this.requestRendition(this.document), this.getRendition(this.document))
                        )
                    )
                    .subscribe({
                        next: (rendition) => {
                            if (hasRenditionBlob(rendition)) {
                                this.blobFile$ = this.blobDownloadService.downloadBlob(rendition.sys_id as string, 'sysrendition_blob');
                                this.isRenditionLoading = false;
                            } else if (!this.isRenditionLoading || rendition['sysrendition_status'] === RenditionStatus.FAILED) {
                                this.blobFile$ = of(new Blob());
                            }
                        },
                        error: () => {
                            this.blobFile$ = of(new Blob());
                            this.isRenditionLoading = false;
                        },
                    });
            }
        }
    }

    private requestRendition(document: Document): Observable<Document> {
        return defer(() =>
            this.renditionsService.requestRenditionCreation(document.sys_id as string, DEFAULT_RENDITION_ID).pipe(
                switchMap((rendition: Document) => this.renditionsService.getRendition(rendition['sysrendition_sourceDoc'], DEFAULT_RENDITION_ID)),
                pollWhile(1000, (rendition) => rendition['sysrendition_sourceDoc'] === RenditionStatus.PENDING),
                finalize(() => (this.isRenditionLoading = false)),
                takeUntilDestroyed(this.destroyRef)
            )
        );
    }

    private getRendition(document: Document): Observable<Document> {
        return defer(() => this.renditionsService.getRendition(document.sys_id as string, DEFAULT_RENDITION_ID)).pipe(
            pollWhile(1000, (rendition) => rendition['sysrendition_status'] === RenditionStatus.PENDING),
            finalize(() => (this.isRenditionLoading = false)),
            takeUntilDestroyed(this.destroyRef)
        );
    }
}
