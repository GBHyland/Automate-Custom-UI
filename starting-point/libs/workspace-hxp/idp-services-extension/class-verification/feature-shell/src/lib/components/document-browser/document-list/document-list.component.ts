/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Subject } from 'rxjs';
import { Component, Output, ChangeDetectionStrategy, Input, QueryList, ViewChildren } from '@angular/core';
import { DragPlaceholderMetadata } from '../../../services/document/idp-drag-drop.service';
import { ListItemComponent } from '../../list-item/list-item.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FloatingToolbarComponent } from '../floating-toolbar/floating-toolbar.component';
import { PageListComponent } from '../page-list/page-list.component';
import { DocumentData } from '../../../directives/document-list.directive';
import { IdpDocument } from '../../../models/screen-models';

@Component({
    selector: 'hyland-idp-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatTooltipModule,
        MatListModule,
        CommonModule,
        DragDropModule,
        MatBadgeModule,
        ListItemComponent,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        PageListComponent,
        FloatingToolbarComponent,
    ],
})
export class DocumentListComponent {
    @Input() documents: DocumentData[] = [];
    @Input() selectedDocumentsCount = 0;
    @Input() placeholder?: DragPlaceholderMetadata;
    @Input() draggingDocuments: IdpDocument[] = [];
    @Input() dropListId = '';
    @Input() showFloatingToolbar = false;

    @Input() documentUniquenessFn!: (index: number, doc: DocumentData) => any;
    @Input() formatDocumentName!: (doc: DocumentData) => string;
    @Input() isElementContained!: (el: HTMLElement) => boolean;

    @Input() onItemKeyDown!: (doc: DocumentData, e: KeyboardEvent) => void;
    @Input() onContainerKeyDown!: (docs: DocumentData[], e: KeyboardEvent) => void;
    @Input() onItemMouseDown!: (doc: DocumentData, e: MouseEvent, mode: string) => void;
    @Input() onItemMouseUp!: (doc: DocumentData, e: MouseEvent) => void;
    @Input() onDoubleClick!: (doc: DocumentData) => void;
    @Input() onMouseEnter!: (doc: DocumentData) => void;
    @Input() onDragStarted!: () => void;
    @Input() onDragStopped!: () => void;
    @Input() onPageCollapseRequest!: (doc: DocumentData) => void;

    @Output() collapseContainer = new Subject();

    @ViewChildren(ListItemComponent) listItems!: QueryList<ListItemComponent>;
    get items(): QueryList<ListItemComponent> {
        return this.listItems;
    }
}
