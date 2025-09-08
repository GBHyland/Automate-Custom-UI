/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ConnectedPosition, Overlay, OverlayConfig, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import {
    AfterViewInit,
    Component,
    DestroyRef,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { finalize } from 'rxjs/operators';
import { MatChip, MatChipsModule } from '@angular/material/chips';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { SearchFilterData } from '@alfresco/adf-hx-content-services/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-search-filter-container',
    templateUrl: './search-filter-container.component.html',
    styleUrls: ['./search-filter-container.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatChipsModule,
        MatIconModule,
        MatTooltipModule,
        OverlayModule,
        PortalModule,
        ReactiveFormsModule,
        TranslatePipe,
    ],
})
export class SearchFilterContainerComponent implements AfterViewInit, OnChanges {
    @Input()
    name = '';

    @Input()
    filterForm: FormGroup = new FormGroup({});

    @Input()
    selectedValue?: SearchFilterData;

    /**
     * Event emitted when the filter overlay is closed without any explicit action (e.g. clear or apply filter)
     */
    @Output()
    overlayClosed: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    filterCleared: EventEmitter<void> = new EventEmitter();

    @Output()
    filterApplied: EventEmitter<SearchFilterData | undefined> = new EventEmitter();

    @ViewChild('template') private template!: TemplateRef<any>;
    @ViewChild('chip') private chip?: MatChip;

    data?: SearchFilterData;
    selectionLabel = '';
    hiddenValuesCount = 0;

    protected isFilterOverlayOpened = false;
    protected overlayPosition: ConnectedPosition[] = [
        {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
        },
    ];
    protected overlayRef?: OverlayRef;
    protected templatePortal?: TemplatePortal<any>;

    private readonly destroyRef = inject(DestroyRef);

    constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {}

    ngAfterViewInit(): void {
        this.templatePortal = new TemplatePortal(this.template, this.viewContainerRef);
    }

    ngOnChanges(changes: SimpleChanges) {
        const { selectedValue } = changes;
        if (!selectedValue) {
            return;
        }
        const currentValue = selectedValue.currentValue as SearchFilterData;
        if (this.data === currentValue || (this.data === undefined && currentValue === undefined) || this.data?.isEquivalentTo(currentValue)) {
            this.filterForm.markAsPristine();
        } else {
            this.filterForm.markAsDirty();
        }
    }

    applyChanges(): void {
        this.data = this.selectedValue;
        this.filterForm.markAsPristine();
        this.computeLabelVisibility();
    }

    clearChanges(): void {
        this.selectedValue = undefined;
        this.data = undefined;
        this.filterForm.markAsPristine();
        this.computeLabelVisibility();
    }

    protected clearFilter(event: Event): void {
        event.stopPropagation();
        event.preventDefault();

        this.clearChanges();
        this.filterCleared.emit();
        this.closeOverlay();
    }

    protected applyFilter(event: Event): void {
        event.stopPropagation();
        event.preventDefault();

        this.applyChanges();
        this.filterApplied.emit(this.data);
        this.closeOverlay();
    }

    protected computeLabelVisibility(): void {
        if ((this.selectedValue?.values || []).length > 0 && this.data?.values) {
            this.selectionLabel = this.data.values[0].label;
            this.hiddenValuesCount = this.data.values.length - 1;
        } else {
            this.selectionLabel = '';
            this.hiddenValuesCount = 0;
        }
    }

    protected hasPendingChanges(): boolean {
        return this.data !== this.selectedValue;
    }

    protected discardPendingChanges(): void {
        this.selectedValue = this.data;
    }

    protected openFilterOverlay(): void {
        const positionStrategy = this.chip
            ? this.overlay.position().flexibleConnectedTo(this.chip._elementRef.nativeElement).withPositions(this.overlayPosition)
            : undefined;

        const overlayConfig = new OverlayConfig({
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            positionStrategy,
        });

        this.overlayRef = this.overlay.create(overlayConfig);
        this.overlayRef.attach(this.templatePortal);

        this.isFilterOverlayOpened = true;

        this.overlayRef
            .backdropClick()
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.closeOverlay())
            )
            .subscribe({
                next: () => {
                    if (this.hasPendingChanges()) {
                        this.discardPendingChanges();
                    }
                    this.overlayClosed.emit();
                    this.closeOverlay();
                },
            });
    }

    protected closeOverlay(): void {
        this.isFilterOverlayOpened = false;
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
        }
    }
}
