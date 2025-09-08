/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZoomControlComponent } from './zoom-control.component';
import { ViewerService } from '../../services/viewer.service';
import { BehaviorSubject } from 'rxjs';
import { getDefaultStateData, StateData } from '../../models/state-data';
import { ConfigDefault } from '../../models/config-default';
import { ToolbarPosition } from '../../models/config-options';
import { UserLayoutOptions } from '../../models/layout';
import { ToolbarConfig } from '../../models/toolbar-config';
import { ToolbarControlPosition, ToolbarItem, ToolbarItemTypes, ToolbarSubItem } from '../../models/toolbar';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { By } from '@angular/platform-browser';
import { EventTypes } from '../../models/events';

describe('ZoomControlComponent', () => {
    let component: ZoomControlComponent;
    let fixture: ComponentFixture<ZoomControlComponent>;
    let mockViewerState$: BehaviorSubject<StateData>;

    beforeEach(async () => {
        mockViewerState$ = new BehaviorSubject<StateData>(getDefaultStateData(ConfigDefault));

        const mockViewerService = {
            viewerState$: mockViewerState$.asObservable(),
            changeViewerState: jasmine.createSpy(),
            viewerConfig: ConfigDefault,
        };

        await TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: ViewerService, useValue: mockViewerService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ZoomControlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        mockViewerState$.complete();
    });

    it('should have nativeElement', async () => {
        await fixture.whenStable();
        const compiled = fixture.nativeElement;
        const zoomToolbarElement = compiled.querySelector('.idp-zoom-container');
        expect(zoomToolbarElement).not.toBeNull();
        expect(compiled.querySelector('.idp-zoom-input input')).not.toBeNull();
        expect(zoomToolbarElement.classList).toContain('idp-left-right');
    });

    it('should have zoom in and zoom out button exist and disabled', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        fixture = TestBed.createComponent(ZoomControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const compiled = fixture.nativeElement;
        const zoomInButton = compiled.querySelector('#zoom_in');
        expect(zoomInButton).not.toBeNull();

        const zoomOutButton = compiled.querySelector('#zoom_out');
        expect(zoomOutButton).not.toBeNull();
        const toolbarItem = component.toolbarItem as ToolbarItem;
        const subItems = toolbarItem.subItems as { [key: string]: { enabled: boolean } };
        expect(toolbarItem).not.toBeNull();
        expect(toolbarItem.type).toEqual(ToolbarItemTypes.Zoom);
        expect(subItems).not.toBeNull();
        const zoomInSubItem = subItems['zoom_in'];
        const zoomOutSubItem = subItems['zoom_out'];
        expect(zoomInSubItem?.enabled).toBeFalse();
        expect(zoomOutSubItem?.enabled).toBeFalse();
    });

    it('should zoom in and zoom out button have proper oder', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        fixture = TestBed.createComponent(ZoomControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = {
                ...item,
                subItems: {
                    zoom_in: {
                        id: 'zoom_in',
                        icon: '',
                        label: '',
                        enabled: false,
                        order: 1,
                    },
                    zoom_out: {
                        id: 'zoom_out',
                        icon: '',
                        label: '',
                        enabled: false,
                        order: 2,
                    },
                },
            };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const zoomInButton = fixture.debugElement.query(By.css('#zoom_in'));
        expect(zoomInButton).not.toBeNull();
        expect(zoomInButton.attributes['order']).toEqual('1');

        const zoomOutButton = fixture.debugElement.query(By.css('#zoom_out'));
        expect(zoomOutButton).not.toBeNull();
        expect(zoomOutButton.attributes['order']).toEqual('2');
    });

    it('should have default zoom level 100', (done) => {
        const mockStateData = getDefaultStateData({
            ...ConfigDefault,
            toolbarPosition: ToolbarPosition.Right,
        });
        mockViewerState$.next(mockStateData);
        fixture.detectChanges();

        component.currentViewerState$.subscribe((state) => {
            expect(state.currentLayout.type).toEqual(UserLayoutOptions.Single_Vertical);
            expect(state.currentToolbarPosition).toEqual('right');
            expect(state.currentZoomLevel).toEqual(100);
            done();
        });
    });

    it('should call onZoomChange with correct parameters when zoom in action is triggered', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        fixture.detectChanges();

        spyOn(component, 'onZoomChange');
        component.currentViewerState = { currentZoomLevel: 100 } as StateData;

        const subItems = item?.subItems as Record<string, ToolbarSubItem>;
        const zoomInSubItem = subItems['zoom_in'];
        component.onToolbarAction(item, zoomInSubItem);
        expect(component.onZoomChange).toHaveBeenCalledWith(125, item);
    });

    it('should call onZoomChange with correct parameters when zoom out action is triggered', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        fixture.detectChanges();

        spyOn(component, 'onZoomChange');
        component.currentViewerState = { currentZoomLevel: 100 } as StateData;

        const subItems = item?.subItems as Record<string, ToolbarSubItem>;
        const zoomInSubItem = subItems['zoom_out'];
        component.onToolbarAction(item, zoomInSubItem);
        expect(component.onZoomChange).toHaveBeenCalledWith(75, item);
    });

    it('should not change zoom level if subitem is not provided', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        fixture.detectChanges();

        spyOn(component, 'onZoomChange');
        component.currentViewerState = { currentZoomLevel: 100 } as StateData;

        component.onToolbarAction(item);
        expect(component.onZoomChange).toHaveBeenCalledWith(100, item);
    });

    it('should set zoom level to default if input is invalid', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        component.currentViewerState = { currentZoomLevel: 100 } as StateData;
        fixture.detectChanges();

        const zoomInput = fixture.debugElement.query(By.css('.idp-zoom-input input'));
        component.onZoomChange('invalid', item);

        expect(zoomInput.nativeElement.value).toBe('100');
    });

    it('should not change zoom level if it is out of bounds', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        component.currentViewerState = { currentZoomLevel: 100 } as StateData;
        fixture.detectChanges();

        const zoomInput = fixture.debugElement.query(By.css('.idp-zoom-input input'));
        component.onZoomChange(400, item);

        expect(zoomInput.nativeElement.value).toBe('100');
    });

    it('should change zoom level if it is within bounds', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        const mockViewerService = TestBed.inject(ViewerService);
        component.toolbarItem = item as ToolbarItem;
        component.currentViewerState = { currentZoomLevel: 125 } as StateData;
        fixture.detectChanges();

        await fixture.whenStable();
        const zoomInput = fixture.debugElement.query(By.css('.idp-zoom-input input'));
        component.onZoomChange(125, item);

        expect(zoomInput.nativeElement.value).toBe('100');
        expect(mockViewerService.changeViewerState).toHaveBeenCalledWith({ currentZoomLevel: 125 }, EventTypes.ZoomChanged);
    });

    it('should set zoom level to default if zoomConfig is invalid', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        component.currentViewerState = { currentZoomLevel: 100 } as StateData;
        fixture.detectChanges();

        const zoomInput = fixture.debugElement.query(By.css('.idp-zoom-input input'));
        component.onZoomChange('invalid', item);

        expect(zoomInput.nativeElement.value).toBe('100');
    });

    it('should call onZoomChange with correct parameters when zoom in action is triggered with valid zoomConfig', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        fixture.detectChanges();

        spyOn(component, 'onZoomChange');
        component.currentViewerState = { currentZoomLevel: 123 } as StateData;

        const subItems = item?.subItems as Record<string, ToolbarSubItem>;
        const zoomInSubItem = subItems['zoom_in'];
        component.onToolbarAction(item, zoomInSubItem);
        expect(component.onZoomChange).toHaveBeenCalledWith(125, item);
    });

    it('should call onZoomChange with correct parameters when zoom out action is triggered with valid zoomConfig', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        fixture.detectChanges();

        spyOn(component, 'onZoomChange');
        component.currentViewerState = { currentZoomLevel: 97 } as StateData;

        const subItems = item?.subItems as Record<string, ToolbarSubItem>;
        const zoomOutSubItem = subItems['zoom_out'];
        component.onToolbarAction(item, zoomOutSubItem);
        expect(component.onZoomChange).toHaveBeenCalledWith(75, item);
    });

    it('should reset input value to current zoom level on blur if input is invalid', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        component.currentViewerState = { currentZoomLevel: 100 } as StateData;
        fixture.detectChanges();

        const zoomInput = fixture.debugElement.query(By.css('.idp-zoom-input input')).nativeElement;
        zoomInput.value = 'invalid';
        zoomInput.dispatchEvent(new Event('blur'));

        expect(zoomInput.value).toBe('100');
    });

    it('should keep input value on blur if input is valid', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        component.currentViewerState = { currentZoomLevel: 100 } as StateData;
        component.inputValue = '125';

        const zoomInput = fixture.debugElement.query(By.css('.idp-zoom-input input')).nativeElement;
        zoomInput.value = '125';
        fixture.detectChanges();

        zoomInput.dispatchEvent(new Event('blur'));

        expect(zoomInput.value).toBe('125');
    });

    it('should keep input value on blur if input is empty', () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Zoom);
        component.toolbarItem = item as ToolbarItem;
        component.currentViewerState = { currentZoomLevel: 100 } as StateData;
        fixture.detectChanges();

        const zoomInput = fixture.debugElement.query(By.css('.idp-zoom-input input')).nativeElement;
        zoomInput.value = '';
        zoomInput.dispatchEvent(new Event('blur'));

        expect(zoomInput.value).toBe('100');
    });

    it('should display zoomOut first for top/bottom position and zoomIn first for left/right position', async () => {
        // Create toolbar item with zoom buttons
        const zoomItem: ToolbarItem = {
            type: ToolbarItemTypes.Zoom,
            enabled: true,
            icon: '',
            label: '',
            canStaySelected: false,
            selected: false,
            order: 1,
            position: ToolbarControlPosition.Start,
            displayType: 'button',
            eventType: EventTypes.ZoomChanged,
            subItems: {
                zoom_in: {
                    id: 'zoom_in',
                    icon: 'zoom_in',
                    label: 'Zoom In',
                    enabled: true,
                    order: 1,
                },
                zoom_out: {
                    id: 'zoom_out',
                    icon: 'zoom_out',
                    label: 'Zoom Out',
                    enabled: true,
                    order: 2,
                },
            },
        };

        // Set up component with top position
        component.toolbarItem = zoomItem;
        mockViewerState$.next({
            ...getDefaultStateData(ConfigDefault),
            currentToolbarPosition: ToolbarPosition.Top,
            currentZoomLevel: 100,
        });

        fixture.detectChanges();
        await fixture.whenStable();

        // Check top position order
        let buttons = fixture.debugElement.queryAll(By.css('.idp-zoom-container button'));
        expect(buttons.length).toBe(2);
        expect(buttons[0].attributes['id']).toBe('zoom_out');
        expect(buttons[1].attributes['id']).toBe('zoom_in');

        // Change to left position
        mockViewerState$.next({
            ...getDefaultStateData(ConfigDefault),
            currentToolbarPosition: ToolbarPosition.Left,
            currentZoomLevel: 100,
        });

        fixture.detectChanges();
        await fixture.whenStable();

        // Check left position order
        buttons = fixture.debugElement.queryAll(By.css('.idp-zoom-container button'));
        expect(buttons.length).toBe(2);
        expect(buttons[0].attributes['id']).toBe('zoom_in');
        expect(buttons[1].attributes['id']).toBe('zoom_out');
    });
});
