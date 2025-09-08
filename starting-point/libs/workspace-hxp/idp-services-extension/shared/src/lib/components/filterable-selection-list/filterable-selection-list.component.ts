/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    EventEmitter,
    inject,
    Input,
    Output,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { asapScheduler, BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { MatListModule, MatListOption } from '@angular/material/list';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { TemplateLetDirective } from '../../directives/template-let.directive';

export interface FilterableSelectionListItem<T> {
    item: T;
    id: any;
    name: string;
}

interface OptionItem<T> {
    data: FilterableSelectionListItem<T>;
    displayName: string;
}

@Component({
    selector: 'hyland-idp-filterable-selection-list',
    templateUrl: './filterable-selection-list.component.html',
    styleUrls: ['./filterable-selection-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, TranslatePipe, TemplateLetDirective],
})
export class FilterableSelectionListComponent<T> implements AfterViewInit {
    @Input() selectedItemId: any | undefined;
    @Input() set items(items: FilterableSelectionListItem<T>[]) {
        this.allItemsSubject$.next(items.map((item, index) => ({ data: item, displayName: `${index + 1} - ${item.name}` })));
    }
    @Input() searchPlaceholderKey: string | undefined;

    @Output() activeItemChanged = new EventEmitter<T | undefined>();

    @ViewChildren(MatListOption) selectionListOptions!: QueryList<MatListOption>;

    readonly allItemsSubject$ = new BehaviorSubject<OptionItem<T>[]>([]);
    readonly searchInputSubject$ = new BehaviorSubject<string>('');
    readonly filteredItems$: Observable<OptionItem<T>[]>;
    readonly selectionChange$ = new BehaviorSubject<OptionItem<T> | undefined>(undefined);
    activeItem$: Observable<OptionItem<T> | undefined>;

    private focusManager?: FocusKeyManager<MatListOption>;

    public destroyRef = inject(DestroyRef);

    constructor() {
        this.filteredItems$ = combineLatest([this.searchInputSubject$, this.allItemsSubject$]).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(([searchText, allItems]) => {
                return searchText && searchText.length > 0
                    ? allItems.filter((item) => item.displayName.toLowerCase().includes(searchText.toLowerCase()))
                    : allItems;
            }),
            tap((items) => {
                this.selectionChange$.next(items[0]);
            })
        );

        this.activeItem$ = this.selectionChange$.pipe(
            takeUntilDestroyed(this.destroyRef),
            distinctUntilChanged((prev, curr) => prev?.data?.id === curr?.data?.id),
            tap((item) => this.activeItemChanged.emit(item?.data?.item))
        );
    }

    ngAfterViewInit(): void {
        this.focusManager = new FocusKeyManager(this.selectionListOptions).withHomeAndEnd().withWrap();
        this.focusManager.change.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.selectionChange$.next(this.focusManager?.activeItem?.value);
        });

        const selectedOption = this.selectedItemId
            ? this.selectionListOptions.find((option) => option.value.data.id === this.selectedItemId)
            : undefined;

        asapScheduler.schedule(() => {
            if (selectedOption) {
                this.focusManager?.setActiveItem(selectedOption);
            } else {
                this.focusManager?.setFirstItemActive();
            }
        });
    }

    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.repeat || event.defaultPrevented) {
            return;
        }

        if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
            this.focusManager?.onKeydown(event);
            this.keepFocusOnTarget(event);
        }
    }

    generateItemAutomationId(name: string): string {
        if (!name) {
            return '';
        }
        return 'idp-dialog-list-item-' + name.toLowerCase().replace(/ /g, '-');
    }

    private keepFocusOnTarget(event: Event): void {
        asapScheduler.schedule(() => {
            if (event.target instanceof HTMLElement) {
                event.target.focus();
            }
        });
    }
}
