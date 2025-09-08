/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsPaginatorComponent } from './results-paginator.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ResultsPaginatorComponent', () => {
    let component: ResultsPaginatorComponent;
    let fixture: ComponentFixture<ResultsPaginatorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ResultsPaginatorComponent, TranslateModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(ResultsPaginatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
