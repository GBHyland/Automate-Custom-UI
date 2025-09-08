/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridViewComponent } from './grid-view.component';
import { of } from 'rxjs';
import { LayoutDirection, LayoutType } from '../../models/layout';
import { TemplateRef } from '@angular/core';
import { ViewerImageData } from '../../models/viewer-image-data';
import { By } from '@angular/platform-browser';

describe('GridViewComponent', () => {
    let component: GridViewComponent;
    let fixture: ComponentFixture<GridViewComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [GridViewComponent],
        });

        fixture = TestBed.createComponent(GridViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should accept layoutInfo input', () => {
        const layoutInfo = {
            type: LayoutType.Grid,
            columnWidthPercent: 100,
            rowHeightPercent: 100,
            fullViewerScreen: false,
            singleRowView: false,
            scrollDirection: LayoutDirection.Vertical,
            currentScaleFactor: 1.25,
        };
        component.layoutInfo = layoutInfo;
        fixture.detectChanges();
        expect(component.layoutInfo).toEqual(layoutInfo);
    });

    it('should accept imageTemplate input', () => {
        const templateRef: TemplateRef<any> = {} as TemplateRef<any>;
        component.imageTemplate = templateRef;
        fixture.detectChanges();
        expect(component.imageTemplate).toBe(templateRef);
    });

    it('should display all the images when displayImages$ is provided', async () => {
        const images: ViewerImageData[] = [
            {
                pageId: '123',
                documentId: '123',
                pageName: 'page1',
                pageNumber: 1,
                firstPageInDoc: true,
                lastPageInDoc: false,
                multiDocumentView: true,
                documentName: 'Document 1',
                customClassToApply: [''],
                image$: of({
                    blobUrl: 'image-src',
                    width: 100,
                    height: 100,
                    rotation: 0,
                    skew: 0,
                }),
            },
            {
                pageId: '234',
                documentId: '234',
                pageName: 'page1',
                pageNumber: 1,
                firstPageInDoc: false,
                lastPageInDoc: true,
                multiDocumentView: true,
                documentName: 'Document 2',
                customClassToApply: [''],
                image$: of({
                    blobUrl: 'image-src',
                    width: 100,
                    height: 100,
                    rotation: 0,
                    skew: 0,
                }),
            },
        ];

        fixture = TestBed.createComponent(GridViewComponent);
        component = fixture.componentInstance;
        component.displayImages$ = of(images);
        fixture.detectChanges();

        await fixture.whenStable();
        const imageElements = fixture.debugElement.queryAll(By.css('.idp-grid-view__image-container'));
        expect(imageElements.length).toBe(2);
    });
});
