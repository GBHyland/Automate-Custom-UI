/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { merge, Observable, Subject } from 'rxjs';
import { filter, mapTo, tap } from 'rxjs/operators';
import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { HxpWorkspaceDocumentTreeComponent } from '@hxp/workspace-hxp/shared/workspace-document-tree';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'hxp-document-location-picker',
    standalone: true,
    imports: [
        AsyncPipe,
        NgClass,
        NgIf,
        MatIconModule,
        TranslatePipe,
        MatInputModule,
        CdkOverlayOrigin,
        CdkConnectedOverlay,
        HxpWorkspaceDocumentTreeComponent,
    ],
    templateUrl: './document-location-picker.component.html',
    styleUrls: ['./document-location-picker.component.scss'],
})
export class DocumentLocationPickerComponent implements OnChanges, OnInit {
    @Input()
    document?: Document;

    @Input()
    edit = false;

    @Input()
    required = false;

    @Output()
    selectedLocation = new EventEmitter<Document>();

    @ViewChild(MatFormField, { read: ElementRef, static: true })
    private matFormFieldEl!: ElementRef;

    @ViewChild(MatInput, { read: ElementRef, static: true })
    private matInputEl!: ElementRef;

    @ViewChild(CdkConnectedOverlay, { static: true })
    private connectedOverlay!: CdkConnectedOverlay;

    protected selectedDocument: [Document] | [] = [];
    protected currentLocation = '...';
    protected width = '0';
    protected positions: ConnectedPosition[] = [
        {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetX: -43,
            offsetY: 16,
        },
    ];
    protected showDropdown$!: Observable<boolean>;
    private onLocationSelected$ = new Subject();
    private isDropdownHidden$?: Observable<boolean>;

    constructor(private focusMonitor: FocusMonitor) {}

    ngOnInit(): void {
        this.isDropdownHidden$ = this.connectedOverlay.backdropClick.pipe(mapTo(false));
        this.showDropdown$ = merge(
            this.isDropdownHidden$,
            this.focusMonitor.monitor(this.matInputEl).pipe(
                filter((focused) => !!focused),
                tap(() => {
                    this.width = this.matFormFieldEl.nativeElement.getBoundingClientRect().width + 'px';
                }),
                mapTo(true)
            ),
            this.onLocationSelected$.pipe(mapTo(false))
        );

        this.connectedOverlay.minWidth = this.width;
    }

    ngOnChanges(): void {
        this.selectedDocument = this.document ? [this.document] : [];
        this.currentLocation = this.document?.sys_path || '...';
    }

    onLocationSelected(document: Document): void {
        this.selectedLocation.next(document);
        this.selectedDocument = [document];
        this.currentLocation = document?.sys_path || '';
        this.onLocationSelected$.next(document);
    }

    onResize(): void {
        this.width = this.matFormFieldEl.nativeElement.getBoundingClientRect().width + 'px';
    }
}
