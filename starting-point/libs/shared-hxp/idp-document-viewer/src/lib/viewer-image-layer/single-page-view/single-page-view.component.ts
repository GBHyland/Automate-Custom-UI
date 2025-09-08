/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { LayoutInfo } from '../../models/layout';
import { ViewerImageData } from '../../models/viewer-image-data';
import { asapScheduler, Observable } from 'rxjs';

@Component({
    standalone: true,
    imports: [NgFor, CommonModule],
    selector: 'hyland-idp-viewer-single-page-view',
    templateUrl: './single-page-view.component.html',
    styleUrls: ['./single-page-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinglePageViewComponent {
    @Input() imageTemplate!: TemplateRef<unknown>;
    @Input() displayImages$?: Observable<ViewerImageData[]>;
    @ViewChild('singlePageView', { static: true }) singlePageView?: ElementRef;
    @Input() set layoutInfo(value: LayoutInfo | undefined) {
        this._layoutInfo = value;
        const container = this.singlePageView?.nativeElement as HTMLElement;
        if (container) {
            this.currentScaleFactor = value?.currentScaleFactor || 1;
            this.transformOrigin = value?.currentScaleFactor !== undefined && value.currentScaleFactor <= 1 ? 'center center' : 'left top';
            asapScheduler.schedule(() => {
                container.scrollIntoView({ inline: 'center', block: 'center' });
            });
        }
    }

    get layoutInfo(): LayoutInfo | undefined {
        return this._layoutInfo;
    }

    currentScaleFactor = 1;
    transformOrigin = 'left top';
    private _layoutInfo?: LayoutInfo;
    readonly pageUniquenessFn = (i: number, image: ViewerImageData) => image?.pageId;

    constructor() {}
}
