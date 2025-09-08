/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @angular-eslint/no-inputs-metadata-property */
/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @angular-eslint/no-outputs-metadata-property */
/* eslint-disable @angular-eslint/no-output-rename */

import { Directive, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';

@Directive({
    selector: '[hxpFilterMenuOverlay]',
    standalone: true,
    hostDirectives: [
        {
            directive: CdkConnectedOverlay,
            inputs: ['cdkConnectedOverlayOrigin: overlayOrigin', 'cdkConnectedOverlayOpen: overlayOpen'],
        },
    ],
})
export class FilterMenuOverlayDirective implements OnInit {
    @Input() overlayOpen = false;
    @Input() overlayOrigin: any;
    @Input() overlayHasBackdrop = true;
    @Input() overlayBackdropClass = 'cdk-overlay-transparent-backdrop';

    @Output() detach = new EventEmitter<void>();

    constructor(private cdkConnectedOverlay: CdkConnectedOverlay) {}

    ngOnInit() {
        this.cdkConnectedOverlay.hasBackdrop = this.overlayHasBackdrop;
        this.cdkConnectedOverlay.backdropClass = this.overlayBackdropClass;

        this.cdkConnectedOverlay.backdropClick.subscribe(() => {
            this.detach.emit();
        });
        this.cdkConnectedOverlay.detach.subscribe(() => {
            this.detach.emit();
        });
    }
}
