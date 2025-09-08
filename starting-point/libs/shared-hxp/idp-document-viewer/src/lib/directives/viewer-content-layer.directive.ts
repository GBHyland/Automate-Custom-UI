/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AfterViewInit, DestroyRef, Directive, inject, Input, TemplateRef } from '@angular/core';
import { ViewerLayerService } from '../services/viewer-layer.service';
import { isValidLayerType, ViewerLayerType } from '../models/viewer-layer';

@Directive({
    selector: '[hylandIdpViewerContentLayer]',
    standalone: true,
})
export class ViewerContentLayerDirective implements AfterViewInit {
    @Input('hylandIdpViewerContentLayer') viewerContentLayer!: ViewerLayerType;
    private readonly templateRef: TemplateRef<unknown> = inject(TemplateRef);
    private readonly viewerLayerService: ViewerLayerService = inject(ViewerLayerService);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        this.destroyRef.onDestroy(() => {
            this.viewerLayerService.unregisterLayer(this.viewerContentLayer);
        });
    }

    ngAfterViewInit(): void {
        if (!this.viewerContentLayer || !isValidLayerType(this.viewerContentLayer)) {
            throw new Error(
                `${this.viewerContentLayer} is not a valid layer type for the content layer.
        Valid types are: ${Object.keys(ViewerLayerType).join(',')}`
            );
        }

        this.viewerLayerService.registerLayer({
            type: this.viewerContentLayer,
            templateRef: this.templateRef,
        });
    }
}
