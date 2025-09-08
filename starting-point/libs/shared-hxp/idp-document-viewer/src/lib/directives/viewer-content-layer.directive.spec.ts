/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewerContentLayerDirective } from './viewer-content-layer.directive';
import { ViewerLayerService } from '../services/viewer-layer.service';
import { ViewerLayerType } from '../models/viewer-layer';

@Component({
    standalone: false,
    template: `<ng-template hylandIdpViewerContentLayer="Image" />`,
})
class TestComponent {
    @ViewChild(ViewerContentLayerDirective, { static: true })
    directive!: ViewerContentLayerDirective;
}

describe('ViewerContentLayerDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let viewerLayerService: jasmine.SpyObj<ViewerLayerService>;

    beforeEach(() => {
        viewerLayerService = jasmine.createSpyObj('ViewerLayerService', ['registerLayer', 'unregisterLayer']);

        TestBed.configureTestingModule({
            imports: [ViewerContentLayerDirective],
            declarations: [TestComponent],
            providers: [{ provide: ViewerLayerService, useValue: viewerLayerService }],
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create an instance', () => {
        expect(component.directive).toBeTruthy();
    });

    it('should register the layer after view init', () => {
        expect(viewerLayerService.registerLayer).toHaveBeenCalledWith({
            type: ViewerLayerType.Image,
            templateRef: jasmine.any(TemplateRef),
        });
    });

    it('should throw an error if the layer type is invalid', () => {
        component.directive.viewerContentLayer = 'invalidLayerType' as ViewerLayerType;
        expect(() => component.directive.ngAfterViewInit()).toThrowError();
    });

    it('should unregister the layer on destroy', () => {
        fixture.destroy();
        expect(viewerLayerService.unregisterLayer).toHaveBeenCalledWith(ViewerLayerType.Image);
    });
});
