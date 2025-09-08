/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeSkeletonLoaderComponent } from './tree-skeleton-loader.component';
import { By } from '@angular/platform-browser';

@Component({
    template: '<hxp-tree-skeleton-loader [skeletonRows]="rows" />',
    standalone: true,
    imports: [TreeSkeletonLoaderComponent],
})
class TestHostComponent {
    rows?: number;
}

describe('TreeSkeletonLoaderComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
    });

    it('should render 10 skeleton rows by default', () => {
        const rows = fixture.debugElement.queryAll(By.css('tbody tr'));

        expect(rows.length).toBe(10);
    });

    it('should render the correct number of skeleton rows when @Input() skeletonRows is set', () => {
        const component = fixture.componentInstance;
        component.rows = 15;
        fixture.detectChanges();
        let rows = fixture.debugElement.queryAll(By.css('tbody tr'));

        expect(rows.length).toBe(15);

        component.rows = 0;
        fixture.detectChanges();
        rows = fixture.debugElement.queryAll(By.css('tbody tr'));

        expect(rows.length).toBe(0);
    });
});
