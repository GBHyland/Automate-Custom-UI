/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LayerSelectionControlComponent } from './layer-selection-control.component';
import { ViewerService } from '../../services/viewer.service';
import { BehaviorSubject } from 'rxjs';
import { getDefaultStateData, StateData } from '../../models/state-data';
import { ConfigDefault } from '../../models/config-default';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ToolbarConfig } from '../../models/toolbar-config';
import { ToolbarItem, ToolbarItemTypes, ToolbarSubItem } from '../../models/toolbar';
import { ViewerLayerType } from '../../models/viewer-layer';
import { EventTypes } from '../../models/events';
import { ToolbarPosition } from '../../models/config-options';
import { By } from '@angular/platform-browser';

describe('LayerSelectionControlComponent', () => {
    let component: LayerSelectionControlComponent;
    let fixture: ComponentFixture<LayerSelectionControlComponent>;
    let mockViewerState$: BehaviorSubject<StateData>;

    beforeEach(() => {
        mockViewerState$ = new BehaviorSubject<StateData>(getDefaultStateData(ConfigDefault));

        const mockViewerService = {
            viewerState$: mockViewerState$.asObservable(),
            changeViewerState: jasmine.createSpy(),
        };

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: ViewerService, useValue: mockViewerService }],
        });

        fixture = TestBed.createComponent(LayerSelectionControlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        mockViewerState$.complete();
    });

    it('should have nativeElement', async () => {
        await fixture.whenStable();
        const compiled = fixture.nativeElement;
        const pageNavigationToolbarElement = compiled.querySelector('.idp-layer-selection-container');
        expect(pageNavigationToolbarElement).not.toBeNull();
        expect(pageNavigationToolbarElement.classList).toContain('idp-left-right');
    });

    it('should have image and text button and disabled', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.LayerSelection);
        fixture = TestBed.createComponent(LayerSelectionControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const compiled = fixture.nativeElement;
        const imageButton = compiled.querySelector('#image');
        expect(imageButton).not.toBeNull();

        const textButton = compiled.querySelector('#text');
        expect(textButton).not.toBeNull();
        const toolbarItem = component.toolbarItem as ToolbarItem;
        expect(toolbarItem).not.toBeNull();
        expect(toolbarItem.type).toEqual(ToolbarItemTypes.LayerSelection);
        expect(toolbarItem.subItems).not.toBeNull();
        const subItems = toolbarItem.subItems as { [key: string]: { enabled: boolean } };
        const imageSubItem = subItems['image'];
        const textSubItem = subItems['text'];
        expect(imageSubItem.enabled).toBeFalse();
        expect(textSubItem.enabled).toBeFalse();
    });

    it('should call changeViewerState when text layout is clicked', () => {
        const item = { type: ToolbarItemTypes.LayerSelection } as ToolbarItem;
        const subitem = { id: 'text' } as ToolbarSubItem;
        const mockViewerService = TestBed.inject(ViewerService);

        component.onToolbarAction(item, subitem);
        expect(mockViewerService.changeViewerState).toHaveBeenCalledWith({ currentLayer: ViewerLayerType.TextOnly }, EventTypes.ViewChanged);
    });

    it('should call changeViewerState when image layout is clicked', () => {
        const mockViewerService = TestBed.inject(ViewerService);
        const item = { type: ToolbarItemTypes.LayerSelection } as ToolbarItem;
        const subitem = { id: 'image' } as ToolbarSubItem;

        component.onToolbarAction(item, subitem);
        expect(mockViewerService.changeViewerState).toHaveBeenCalledWith({ currentLayer: ViewerLayerType.Image }, EventTypes.ViewChanged);
    });

    it('should call onToolbarAction when text layout is clicked', fakeAsync(() => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.LayerSelection);
        fixture = TestBed.createComponent(LayerSelectionControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        const mockViewerService = TestBed.inject(ViewerService);

        const textButton = fixture.debugElement.query(By.css('#text'));
        textButton.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        fixture.detectChanges();
        tick(50);

        expect(mockViewerService.changeViewerState).toHaveBeenCalledWith({ currentLayer: ViewerLayerType.TextOnly }, EventTypes.ViewChanged);
    }));

    it('should call onToolbarAction when image layout is clicked', fakeAsync(() => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.LayerSelection);
        fixture = TestBed.createComponent(LayerSelectionControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        const mockViewerService = TestBed.inject(ViewerService);

        const textButton = fixture.debugElement.query(By.css('#image'));
        textButton.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        fixture.detectChanges();
        tick(50);

        expect(mockViewerService.changeViewerState).toHaveBeenCalledWith({ currentLayer: ViewerLayerType.Image }, EventTypes.ViewChanged);
    }));

    it('should set isLeftRightPosition$ to true when toolbar position is left', () => {
        mockViewerState$.next({
            ...getDefaultStateData(ConfigDefault),
            currentToolbarPosition: ToolbarPosition.Left,
        });

        component.isLeftRightPosition$.subscribe((isLeftRight) => {
            expect(isLeftRight).toBeTrue();
        });
    });

    it('should set isLeftRightPosition$ to true when toolbar position is right', () => {
        mockViewerState$.next({
            ...getDefaultStateData(ConfigDefault),
            currentToolbarPosition: ToolbarPosition.Right,
        });

        component.isLeftRightPosition$.subscribe((isLeftRight) => {
            expect(isLeftRight).toBeTrue();
        });
    });

    it('should set isLeftRightPosition$ to false when toolbar position is top', () => {
        mockViewerState$.next({
            ...getDefaultStateData(ConfigDefault),
            currentToolbarPosition: ToolbarPosition.Top,
        });

        component.isLeftRightPosition$.subscribe((isLeftRight) => {
            expect(isLeftRight).toBeFalse();
        });
    });

    it('should set isLeftRightPosition$ to false when toolbar position is bottom', () => {
        mockViewerState$.next({
            ...getDefaultStateData(ConfigDefault),
            currentToolbarPosition: ToolbarPosition.Bottom,
        });

        component.isLeftRightPosition$.subscribe((isLeftRight) => {
            expect(isLeftRight).toBeFalse();
        });
    });
});
