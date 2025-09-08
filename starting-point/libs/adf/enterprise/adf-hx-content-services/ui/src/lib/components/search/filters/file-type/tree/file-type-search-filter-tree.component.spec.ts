/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileTypeSearchFilterTreeComponent } from './file-type-search-filter-tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { CheckboxHarnessUtils, TreeHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { TREE_DATA } from './file-type-search-filter-file-type-node';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('FileTypeSearchFilterTreeComponent', () => {
    let component: FileTypeSearchFilterTreeComponent;
    let fixture: ComponentFixture<FileTypeSearchFilterTreeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [FileTypeSearchFilterTreeComponent, NoopTranslateModule, MatCheckboxModule, MatIconModule, MatIconTestingModule, MatTreeModule],
        }).compileComponents();

        fixture = TestBed.createComponent(FileTypeSearchFilterTreeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should correctly initialize the file type tree with the expected nodes', async () => {
        const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);

        const [node1, node2, node3, node4, node5] = nodes;
        const node1Text = await node1.getText();
        const node2Text = await node2.getText();
        const node3Text = await node3.getText();
        const node4Text = await node4.getText();
        const node5Text = await node5.getText();

        expect(node1Text).toEqual(TREE_DATA[0].label);
        expect(node2Text).toEqual(TREE_DATA[1].label);
        expect(node3Text).toEqual(TREE_DATA[2].label);
        expect(node4Text).toEqual(TREE_DATA[3].label);
        expect(node5Text).toEqual(TREE_DATA[4].label);
    });

    it('should expand and collapse parent nodes and update the tree accordingly', async () => {
        let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);

        const [firstNode] = nodes;
        await firstNode.toggle();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes.length).toBeGreaterThan(5);

        await firstNode.toggle();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);
    });

    it('should select a leaf node and emit the selected file types', async () => {
        jest.spyOn(component.selectedFileTypes, 'emit');

        const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);

        const [firstNode] = nodes;
        await firstNode.toggle();

        let selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(0);

        const checkboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: false } });

        expect(checkboxes).toHaveLength(10);

        await checkboxes[1].toggle();

        selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(1);

        expect(component.selectedFileTypes.emit).toHaveBeenCalledWith([
            expect.objectContaining({
                id: 'documents/portable-document-format',
            }),
        ]);
    });

    it('should select a parent node and all its descendants, and emit the selected file types', async () => {
        jest.spyOn(component.selectedFileTypes, 'emit');

        const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);

        const [firstNode] = nodes;
        await firstNode.toggle();

        let selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(0);

        const checkboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: false } });

        expect(checkboxes).toHaveLength(10);

        await checkboxes[0].toggle();

        selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(6);

        expect(component.selectedFileTypes.emit).toHaveBeenCalledWith([
            expect.objectContaining({
                id: 'documents',
            }),
            expect.objectContaining({
                id: 'documents/portable-document-format',
            }),
            expect.objectContaining({
                id: 'documents/presentation',
            }),
            expect.objectContaining({
                id: 'documents/spreadsheet',
            }),
            expect.objectContaining({
                id: 'documents/text-document',
            }),
            expect.objectContaining({
                id: 'documents/text-file',
            }),
        ]);
    });

    it('should deselect a parent node and all its descendants, and emit the selected file types', async () => {
        jest.spyOn(component.selectedFileTypes, 'emit');

        const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);

        const [firstNode] = nodes;
        await firstNode.toggle();

        const checkboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: false } });

        expect(checkboxes).toHaveLength(10);

        await checkboxes[0].toggle();

        let selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(6);

        await checkboxes[0].toggle();

        selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(0);
        expect(component.selectedFileTypes.emit).toHaveBeenCalledWith([]);
    });

    it('should filter the tree based on the input and display only matching nodes', async () => {
        let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);

        component.filteredFileType = 'Presentation';
        component.ngOnChanges();
        fixture.detectChanges();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(2);

        const [parentNode, childNode] = nodes;
        const parentNodeText = await parentNode.getText();
        const childNodeText = await childNode.getText();

        expect(parentNodeText).toContain('SEARCH.FILTERS.FILE_TYPE.CATEGORIES.DOCUMENTS.LABEL');
        expect(childNodeText).toContain('SEARCH.FILTERS.FILE_TYPE.CATEGORIES.DOCUMENTS.FORMATS.PRESENTATION');

        component.filteredFileType = '';
        component.ngOnChanges();
        fixture.detectChanges();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);
    });

    it('should display the no results template when no nodes match the filter', async () => {
        const nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);

        let noResultsTemplate = fixture.nativeElement.querySelector('.hxp-file-type-no-results');
        expect(noResultsTemplate).toBeFalsy();

        component.filteredFileType = 'NonExistentNode';
        component.ngOnChanges();
        fixture.detectChanges();

        noResultsTemplate = fixture.nativeElement.querySelector('.hxp-file-type-no-results');

        expect(noResultsTemplate).toBeTruthy();
    });

    it('should retain selection and selected nodes visible when filtering the tree', async () => {
        let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);

        const [firstNode] = nodes;
        await firstNode.toggle();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(10);

        const checkboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: false } });

        expect(checkboxes).toHaveLength(10);

        await checkboxes[1].toggle();

        let selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(1);

        component.filteredFileType = 'document';
        component.ngOnChanges();
        fixture.detectChanges();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(6);
        expect(await nodes[1].getText()).toContain('SEARCH.FILTERS.FILE_TYPE.CATEGORIES.DOCUMENTS.FORMATS.PORTABLE_DOCUMENT_FORMAT');

        selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(1);

        component.filteredFileType = '';
        component.ngOnChanges();
        fixture.detectChanges();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(10);

        selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(1);
    });

    it('should retain selection when the selected node is not displayed after filtering', async () => {
        let nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(5);

        const [firstNode] = nodes;
        await firstNode.toggle();

        const checkboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: false } });

        expect(checkboxes).toHaveLength(10);

        await checkboxes[1].toggle();

        let selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(1);

        component.filteredFileType = 'Audio';
        component.ngOnChanges();
        fixture.detectChanges();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(3);

        selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(0);

        component.filteredFileType = '';
        component.ngOnChanges();
        fixture.detectChanges();

        nodes = await TreeHarnessUtils.getTreeNodes({ fixture });

        expect(nodes).toHaveLength(10);

        selectedCheckboxes = await CheckboxHarnessUtils.getAllCheckboxes({ fixture, checkboxFilters: { checked: true } });

        expect(selectedCheckboxes).toHaveLength(1);
    });
});
