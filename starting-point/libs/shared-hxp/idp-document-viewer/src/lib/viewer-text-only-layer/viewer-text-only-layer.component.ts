/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, Input, SecurityContext, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, Observable, switchMap } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { TextRect } from '../models/text-layer/size';
import { ViewerLayerHostData, ViewerLayerType } from '../models/viewer-layer';
import { ViewerTextLayerService } from '../services/viewer-text-layer.service';
import { ViewerLayoutData } from '../models/text-layer/ocr-candidate';
import { ViewerService } from '../services/viewer.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';

export type TooltipInfo = TextRect & { rotation: number; scale: number };

const LAYER_TYPE = ViewerLayerType.TextOnly;

@Component({
    selector: 'hyland-idp-viewer-text-only-layer',
    templateUrl: './viewer-text-only-layer.component.html',
    styleUrls: ['./viewer-text-only-layer.component.scss'],
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerTextOnlyLayerComponent implements AfterViewInit {
    @Input() host!: ViewerLayerHostData;
    @ViewChild('containerTexOnly') containerElement?: ElementRef<HTMLDivElement>;

    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly viewerService: ViewerService = inject(ViewerService);
    private readonly viewerTextService: ViewerTextLayerService = inject(ViewerTextLayerService);
    private readonly currentPageId$ = new BehaviorSubject<string | undefined>(undefined);
    private readonly sanitizer = inject(DomSanitizer);
    textContent$: Observable<ViewerLayoutData | undefined>;

    constructor() {
        this.textContent$ = combineLatest([
            this.currentPageId$.pipe(
                filter((pageId) => !!pageId),
                distinctUntilChanged(),
                switchMap(() => this.viewerTextService.textLayoutData$.pipe(debounceTime(50)))
            ),
            this.viewerTextService.scaledActiveHighlights$.pipe(startWith([])),
            this.viewerService.viewerState$.pipe(
                map((state) => state.currentLayer),
                distinctUntilChanged()
            ),
        ]).pipe(
            map(([textContent, activeHighlights]) => {
                if (!textContent) {
                    return undefined;
                }
                textContent = textContent.replace(/#\d+/g, '');

                for (const highlight of activeHighlights) {
                    const searchText = highlight.textData.text;
                    const normalizedSearchText = searchText.trim().toLowerCase();
                    const normalizedTextContent = textContent.trim().toLowerCase();
                    if (normalizedTextContent.includes(normalizedSearchText) && searchText.trim() !== '') {
                        textContent = textContent.replace(
                            new RegExp(escapeRegExp(searchText.trim()), 'gi'),
                            this.sanitizer.sanitize(
                                SecurityContext.HTML,
                                `<span class=idp-layout-background-text__${highlight.textData.highlightState.toLowerCase()}>${searchText}</span>`
                            ) || ''
                        );
                    }
                }
                return {
                    text: textContent,
                    pageId: this.host.pageId,
                };
            }),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    ngAfterViewInit(): void {
        this.initializeWithHost();
        this.currentPageId$.next(this.host.pageId);
    }

    private initializeWithHost(): void {
        if (!this.host) {
            throw new Error(`"host" input is required for ${LAYER_TYPE} layer.`);
        }

        this.viewerTextService.initialize(this.host);
        this.currentPageId$.next(this.host.pageId);
    }
}

function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
