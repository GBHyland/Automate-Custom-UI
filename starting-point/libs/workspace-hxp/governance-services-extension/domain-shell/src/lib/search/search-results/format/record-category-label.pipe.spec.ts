/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordCategoryLabelPipe } from './record-category-label.pipe';
import { GovernanceConfigurationService } from '../../../config/governance-config.service';
import { of } from 'rxjs';
import { CommonModule, AsyncPipe } from '@angular/common';

const mockCategories = [
    { name: 'Category 1', id: 'category1' },
    { name: 'Category 2', id: 'category2' },
];

const mockConfig = {
    categories: mockCategories,
    dataSources: [],
    filePlans: [],
};

@Component({
    template: `
        <div class="known">{{ 'category1' | recordCategoryLabel }}</div>
        <div class="unknown">{{ 'unknown' | recordCategoryLabel }}</div>
    `,
    standalone: true,
    imports: [CommonModule, RecordCategoryLabelPipe],
})
class TestHostComponent {}

describe('RecordCategoryLabelPipe (template test)', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let element: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
            providers: [
                {
                    provide: GovernanceConfigurationService,
                    useValue: {
                        getConfig: jest.fn().mockReturnValue(of(mockConfig)),
                    },
                },
                AsyncPipe,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        element = fixture.nativeElement;
    });

    it('should return the category name for a known id', () => {
        const text = element.querySelector('.known')?.textContent?.trim();
        expect(text).toBe('Category 1');
    });

    it('should return an empty string for an unknown id', () => {
        const text = element.querySelector('.unknown')?.textContent?.trim();
        expect(text).toBe('');
    });
});
