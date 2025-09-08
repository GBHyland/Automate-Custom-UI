/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdpThumbnailViewerListItemComponent } from './idp-thumbnail-viewer-list-item.component';
import { MatListModule } from '@angular/material/list';
import { Component } from '@angular/core';

@Component({
    standalone: false,
    template: `
        <hyland-idp-thumbnail-viewer-list-item [isSelected]="isSelected" (click)="onClick()">
            <div>Test Content</div>
        </hyland-idp-thumbnail-viewer-list-item>
    `,
})
class TestHostComponent {
    isSelected = false;
    onClick = jasmine.createSpy('onClick');
}

describe('IdpThumbnailViewerListItemComponent', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let thumbnailElement: HTMLElement;
    let thumbnailComponent: IdpThumbnailViewerListItemComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestHostComponent],
            imports: [IdpThumbnailViewerListItemComponent, MatListModule],
        });

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        thumbnailElement = fixture.nativeElement.querySelector('hyland-idp-thumbnail-viewer-list-item');
        thumbnailComponent = fixture.debugElement.query(
            (sel) => sel.componentInstance instanceof IdpThumbnailViewerListItemComponent
        ).componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should have list-item role', () => {
        expect(thumbnailElement.getAttribute('role')).toBe('list-item');
    });

    it('should emit click event when clicked', () => {
        thumbnailElement.click();
        expect(component.onClick).toHaveBeenCalled();
    });

    it('should project content correctly', () => {
        const content = thumbnailElement.textContent;
        expect(content).toContain('Test Content');
    });

    it('should call focus on element when focus method is called', () => {
        const focusSpy = spyOn(thumbnailElement, 'focus');
        thumbnailComponent.focus();
        expect(focusSpy).toHaveBeenCalled();
    });
});
