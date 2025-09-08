/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SinglePageViewComponent } from './single-page-view.component';
import { of } from 'rxjs';
import { ViewerImageData } from '../../models/viewer-image-data';
import { LayoutType } from '../../models/layout';
import { TemplateRef } from '@angular/core';

describe('SinglePageViewComponent', () => {
    let component: SinglePageViewComponent;
    let fixture: ComponentFixture<SinglePageViewComponent>;

    beforeEach(() => {
        fixture = TestBed.createComponent(SinglePageViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should have default pageUniquenessFn', () => {
        const image: ViewerImageData = {
            pageId: '123',
            documentId: '123',
            pageName: 'page1',
            documentName: 'Document 1',
            pageNumber: 1,
            firstPageInDoc: true,
            lastPageInDoc: true,
            multiDocumentView: false,
            customClassToApply: [''],
            image$: of({
                blobUrl: 'image-src',
                width: 100,
                height: 100,
                rotation: 0,
                skew: 0,
            }),
        };
        expect(component.pageUniquenessFn(0, image)).toBe('123');
    });

    it('should accept layoutInfo input', async () => {
        const layoutInfo = {
            type: LayoutType.SinglePage,
            columnWidthPercent: 100,
            rowHeightPercent: 100,
            fullViewerScreen: false,
            singleRowView: false,
            currentScaleFactor: 1.25,
        };
        component.layoutInfo = layoutInfo;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.currentScaleFactor).toBe(layoutInfo.currentScaleFactor);
    });

    it('should call scroll into view when zoom in triggered ', async () => {
        const layoutInfo = {
            type: LayoutType.SinglePage,
            columnWidthPercent: 100,
            rowHeightPercent: 100,
            fullViewerScreen: false,
            singleRowView: false,
            currentScaleFactor: 1.25,
        };

        component.singlePageView = { nativeElement: { scrollIntoView: jasmine.createSpy() } } as any;
        component.layoutInfo = layoutInfo;
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.currentScaleFactor).toBe(layoutInfo.currentScaleFactor);
        expect(component.singlePageView?.nativeElement.scrollIntoView).toHaveBeenCalledWith({ inline: 'center', block: 'center' });
    });

    it('should accept imageTemplate input', () => {
        const templateRef: TemplateRef<any> = {} as TemplateRef<any>;
        component.imageTemplate = templateRef;
        fixture.detectChanges();
        expect(component.imageTemplate).toBe(templateRef);
    });

    it('should accept displayImages$ input', () => {
        const images: ViewerImageData[] = [
            {
                pageId: '123',
                documentId: '123',
                pageName: 'page1',
                pageNumber: 1,
                firstPageInDoc: true,
                lastPageInDoc: true,
                multiDocumentView: false,
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
        ];
        component.displayImages$ = of(images);
        fixture.detectChanges();
        component.displayImages$?.subscribe((data) => {
            expect(data).toEqual(images);
        });
    });

    it('should set layoutInfo and getter gets correct value', async () => {
        const layoutInfo = {
            type: LayoutType.SinglePage,
            columnWidthPercent: 100,
            rowHeightPercent: 100,
            fullViewerScreen: false,
            singleRowView: false,
            currentScaleFactor: 0.75,
        };

        component.singlePageView = { nativeElement: { scrollIntoView: jasmine.createSpy() } } as any;
        component.layoutInfo = layoutInfo;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.layoutInfo?.type).toBe(layoutInfo.type);
    });
});
