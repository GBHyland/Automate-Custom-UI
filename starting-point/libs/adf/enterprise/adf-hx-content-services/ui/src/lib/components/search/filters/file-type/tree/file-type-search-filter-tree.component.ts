/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { FileTypeFlatNode, FileTypeNode, TREE_DATA } from './file-type-search-filter-file-type-node';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { ArrayToStringPipe } from '../array-to-string.pipe';

@Component({
    selector: 'hxp-file-type-search-filter-tree',
    templateUrl: './file-type-search-filter-tree.component.html',
    styleUrls: ['./file-type-search-filter-tree.component.scss'],
    standalone: true,
    imports: [ArrayToStringPipe, NgIf, MatCheckboxModule, MatTreeModule, MatIconModule, MatButtonModule, MimeTypeIconComponent, TranslatePipe],
})
export class FileTypeSearchFilterTreeComponent implements OnChanges {
    protected flatNodeMap = new Map<FileTypeFlatNode, FileTypeNode>();

    protected nestedNodeMap = new Map<FileTypeNode, FileTypeFlatNode>();

    protected selectedParent: FileTypeFlatNode | null = null;

    protected treeControl: FlatTreeControl<FileTypeFlatNode>;

    protected treeFlattener: MatTreeFlattener<FileTypeNode, FileTypeFlatNode>;

    protected dataSource: MatTreeFlatDataSource<FileTypeNode, FileTypeFlatNode>;

    protected fileTypeSelection = new SelectionModel<FileTypeFlatNode>(true, [], true, (node1, node2) => node1.id === node2.id);

    @Input()
    filteredFileType!: string;

    @Output()
    selectedFileTypes: EventEmitter<FileTypeFlatNode[]> = new EventEmitter();

    constructor() {
        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<FileTypeFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = TREE_DATA;
    }

    ngOnChanges(): void {
        this.filterTree(this.filteredFileType);
    }

    public fileTypeSelectionToggleById(nodeId: string) {
        const treeNode = this.treeControl.dataNodes.find((n) => n.id === nodeId);
        const node = this.flatNodeMap.get(treeNode as FileTypeFlatNode);
        if (node) {
            this.fileTypeSelectionToggle(this.nestedNodeMap.get(node) as FileTypeFlatNode);
        }
    }

    public fileTypeSelectionToggle(node: FileTypeFlatNode): void {
        this.fileTypeSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        if (this.fileTypeSelection.isSelected(node)) {
            this.fileTypeSelection.select(...descendants);
        } else {
            this.fileTypeSelection.deselect(...descendants);
        }

        // Force update for the parent
        for (const child of descendants) {
            this.fileTypeSelection.isSelected(child);
        }
        this.checkAllParentsSelection(node);
        this.selectedFileTypes.emit(this.fileTypeSelection.selected);
        // keep the selected nodes expanded
        this.expandSelectedNodes();
    }

    public clearSelection(): void {
        this.fileTypeSelection.clear();
        this.treeControl.collapseAll();
    }

    protected onNodeExpand(event: Event) {
        event.preventDefault();
        event.stopPropagation();
    }

    protected getLevel = (node: FileTypeFlatNode) => node.level || 0;

    protected isExpandable = (node: FileTypeFlatNode) => node.expandable || false;

    protected getChildren = (node: FileTypeNode): FileTypeNode[] => (node.formats as unknown as FileTypeNode[]) || [];

    protected hasChild = (_: number, _nodeData: FileTypeFlatNode) => _nodeData.expandable;

    protected hasNoContent = (_: number, _nodeData: FileTypeFlatNode) => _nodeData.label === '';

    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    protected transformer = (node: FileTypeNode, level: number): FileTypeFlatNode => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.label === node.label ? existingNode : new FileTypeFlatNode();
        flatNode.id = node.id;
        flatNode.label = node.label;
        flatNode.level = level;
        flatNode.expandable = !!node.formats?.length;
        if (!flatNode.expandable) {
            flatNode.mimeTypes = (node as any)['mimeTypes'];
            flatNode.extensions = (node as any)['extensions'];
            flatNode.mimeTypeIcon = (node as any)['mimeTypeIcon'];
        }
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    };

    protected descendantsAllSelected(node: FileTypeFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected =
            descendants.length > 0 &&
            descendants.every((child) => {
                return this.fileTypeSelection.isSelected(child);
            });
        return descAllSelected;
    }

    protected descendantsPartiallySelected(node: FileTypeFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some((child) => this.fileTypeSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }

    protected leafItemSelectionToggle(node: FileTypeFlatNode): void {
        this.fileTypeSelectionToggle(node);
        this.checkAllParentsSelection(node);
    }

    protected checkAllParentsSelection(node: FileTypeFlatNode): void {
        let parent: FileTypeFlatNode | null = this.getParentNode(node);
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = this.getParentNode(parent);
        }
    }

    protected checkRootNodeSelection(node: FileTypeFlatNode): void {
        const nodeSelected = this.fileTypeSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected =
            descendants.length > 0 &&
            descendants.every((child) => {
                return this.fileTypeSelection.isSelected(child);
            });
        if (nodeSelected && !descAllSelected) {
            this.fileTypeSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
            this.fileTypeSelection.select(node);
        }
    }

    private getParentNode(node: FileTypeFlatNode): FileTypeFlatNode | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    private filterTree(filterText: string) {
        this.dataSource.data = this.filterRecursive(filterText, TREE_DATA, 'label');
        if (filterText) {
            this.treeControl.expandAll();
        } else {
            // confirm if parent nodes are selected or not, because in case of filter we need to recheck the parent selection
            [...this.flatNodeMap.keys()].forEach((node: FileTypeFlatNode) => this.checkAllParentsSelection(node));
            this.expandSelectedNodes();
        }
    }

    private filterRecursive(filterText: string, data: FileTypeNode[], property: string): FileTypeNode[] {
        if (!filterText) {
            return data;
        }

        const copy = (o: any) => {
            return Object.assign({}, o);
        };

        filterText = filterText.toLowerCase();
        const filteredData = data.map(copy).filter(function x(y) {
            if (y[property].toLowerCase().includes(filterText)) {
                return true;
            }
            if (y?.formats) {
                return (y.formats = y.formats.map(copy).filter(x)).length;
            }
            if (y?.extensions) {
                return y.extensions.some((ext: string[]) => ext.includes(filterText));
            }
        });
        return filteredData;
    }

    /**
     * Expands all selected nodes to make inner nodes visible.
     */
    private expandSelectedNodes() {
        for (const node of this.treeControl.dataNodes) {
            if (this.descendantsPartiallySelected(node) || this.descendantsAllSelected(node)) {
                this.treeControl.expand(node);
                let parent = this.getParentNode(node);
                while (parent) {
                    this.treeControl.expand(parent);
                    parent = this.getParentNode(parent);
                }
            }
        }
    }
}
