/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TemplateLetDirective } from './template-let.directive';

describe('TemplateLetDirective', () => {
    it('should work in a template with as syntax', () => {
        @Component({
            template: '<ng-container *hylandIdpLet="value as data">{{data}},{{data}}</ng-container>',
            standalone: true,
            imports: [TemplateLetDirective],
        })
        class TestComponent {
            public value = 'test';
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('test,test');
    });

    it('should work in a template with no value', () => {
        @Component({
            template: '<ng-container *hylandIdpLet>test</ng-container>',
            standalone: true,
            imports: [TemplateLetDirective],
        })
        class TestComponent {}
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('test');
    });

    it('should work in a template with implicit syntax', () => {
        @Component({
            template: '<ng-container *hylandIdpLet="value; let data">{{data}},{{data}}</ng-container>',
            standalone: true,
            imports: [TemplateLetDirective],
        })
        class TestComponent {
            public value = 'test';
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('test,test');
    });

    it('should work in a template with async pipe', () => {
        @Component({
            template: '<ng-container *hylandIdpLet="value | async; let data">{{data}},{{data}}</ng-container>',
            standalone: true,
            imports: [TemplateLetDirective, CommonModule],
        })
        class TestComponent {
            public value: Observable<string> = of('test');
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('test,test');
    });

    it('should work in a template with async pipe and change', () => {
        @Component({
            template: '<ng-container *hylandIdpLet="value | async; let data">{{data}},{{data}}</ng-container>',
            standalone: true,
            imports: [TemplateLetDirective, CommonModule],
        })
        class TestComponent {
            public subject = new BehaviorSubject('test');
            public value: Observable<string> = this.subject.asObservable();
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('test,test');
        (fixture.debugElement.componentInstance as TestComponent).subject.next('test2');
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('test2,test2');
    });

    it('should work in a template with nested directive', () => {
        @Component({
            template: `<ng-container *hylandIdpLet="parent; let parentData"
                >{{ parentData }},<ng-container *hylandIdpLet="child; let childData">{{ child }}</ng-container></ng-container
            >`,
            standalone: true,
            imports: [TemplateLetDirective],
        })
        class TestComponent {
            public parent = 'parent';
            public child = 'child';
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('parent,child');
    });

    it('ngTemplateContextGuard should return true', () => {
        expect(TemplateLetDirective.ngTemplateContextGuard({} as any, {})).toEqual(true);
    });
});
