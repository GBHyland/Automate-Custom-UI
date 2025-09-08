/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@alfresco/adf-core';
import { SingleScrollableViewComponent } from './single-scrollable-view.component';
import { TemplateRef } from '@angular/core';
import { of } from 'rxjs';
import { LayoutDirection, LayoutType } from '../../models/layout';
import { ViewerImageData } from '../../models/viewer-image-data';

describe('SingleScrollableViewComponent', () => {
    let component: SingleScrollableViewComponent;
    let fixture: ComponentFixture<SingleScrollableViewComponent>;

    const mockNotificationService = {
        showInfo: () => {},
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SingleScrollableViewComponent],
            providers: [
                {
                    provide: NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SingleScrollableViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
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
            type: LayoutType.SingleScrollable,
            columnWidthPercent: 100,
            rowHeightPercent: 100,
            fullViewerScreen: false,
            singleRowView: false,
            scrollDirection: LayoutDirection.Horizontal,
            currentScaleFactor: 1.25,
        };
        component.layoutInfo = layoutInfo;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.currentScaleFactor).toBe(layoutInfo.currentScaleFactor);
        expect(component.scrollDirection).toBe(layoutInfo.scrollDirection);
    });

    it('should call scroll into view when zoom in triggered ', async () => {
        const layoutInfo = {
            type: LayoutType.SingleScrollable,
            columnWidthPercent: 100,
            rowHeightPercent: 100,
            fullViewerScreen: false,
            singleRowView: false,
            scrollDirection: LayoutDirection.Vertical,
            currentScaleFactor: 1.25,
        };
        if (component.singleScrollableView) {
            component.singleScrollableView.nativeElement.scrollIntoView = jasmine.createSpy();
        }
        component.layoutInfo = layoutInfo;
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.currentScaleFactor).toBe(layoutInfo.currentScaleFactor);
        expect(component.scrollDirection).toBe(layoutInfo.scrollDirection);
        expect(component.singleScrollableView?.nativeElement.scrollIntoView).toHaveBeenCalledWith({ inline: 'center', block: 'nearest' });
    });

    it('should call scroll into view  when zoom out triggered on Horizontal Layout', async () => {
        const layoutInfo = {
            type: LayoutType.SingleScrollable,
            columnWidthPercent: 100,
            rowHeightPercent: 100,
            fullViewerScreen: false,
            singleRowView: false,
            scrollDirection: LayoutDirection.Horizontal,
            currentScaleFactor: 0.75,
        };

        if (component.singleScrollableView) {
            component.singleScrollableView.nativeElement.scrollIntoView = jasmine.createSpy();
        }
        component.layoutInfo = layoutInfo;
        fixture.detectChanges();

        await fixture.whenStable();
        expect(component.currentScaleFactor).toBe(layoutInfo.currentScaleFactor);
        expect(component.scrollDirection).toBe(layoutInfo.scrollDirection);
        expect(component.singleScrollableView?.nativeElement.scrollIntoView).toHaveBeenCalledWith({ inline: 'nearest', block: 'nearest' });
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
});
