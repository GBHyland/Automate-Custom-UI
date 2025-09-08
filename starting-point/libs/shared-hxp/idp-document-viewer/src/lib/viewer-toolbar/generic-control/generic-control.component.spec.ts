/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenericControlComponent } from './generic-control.component';
import { ViewerService } from '../../services/viewer.service';
import { BehaviorSubject } from 'rxjs';
import { getDefaultStateData, StateData } from '../../models/state-data';
import { ConfigDefault } from '../../models/config-default';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ToolbarItem, ToolbarItemTypes } from '../../models/toolbar';
import { ToolbarConfig } from '../../models/toolbar-config';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { userLayoutOptionsFromString } from '../../models/layout';
import { EventTypes } from '../../models/events';

describe('GenericControlComponent', () => {
    let component: GenericControlComponent;
    let fixture: ComponentFixture<GenericControlComponent>;
    let mockViewerState$: BehaviorSubject<StateData>;
    let menuTrigger: MatMenuTrigger;

    beforeEach(async () => {
        mockViewerState$ = new BehaviorSubject<StateData>(getDefaultStateData(ConfigDefault));

        const mockViewerService = {
            viewerState$: mockViewerState$.asObservable(),
            changeUserSelectedLayout: jasmine.createSpy('changeUserSelectedLayout'),
            changeViewerState: jasmine.createSpy('changeViewerState'),
            changeToolbarItemSelectionState: jasmine.createSpy('changeToolbarItemSelectionState'),
        };
        await TestBed.configureTestingModule({
            imports: [
                GenericControlComponent,
                NoopTranslateModule,
                NoopAnimationsModule,
                CommonModule,
                MatIconModule,
                MatButtonModule,
                MatMenuModule,
                MatTooltipModule,
            ],
            providers: [{ provide: ViewerService, useValue: mockViewerService }],
        }).compileComponents();

        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        mockViewerState$.complete();
        fixture.destroy();
    });

    it('should have nativeElement', async () => {
        await fixture.whenStable();
        const compiled = fixture.nativeElement;
        const genericControlToolbarElement = compiled.querySelector('.idp-generic-control-container');
        expect(genericControlToolbarElement).not.toBeNull();
        expect(genericControlToolbarElement.classList).toContain('idp-left-right');

        expect(compiled.querySelector('.idp-toolbar-button')).not.toBeNull();
    });

    it('should have menu button exist and open up menu on click', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.LayoutChange);
        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const compiled = fixture.nativeElement as HTMLElement;
        const matMenuElement = compiled.querySelector('.idp-menu-button');
        expect(matMenuElement).not.toBeNull();

        const menuButton = fixture.debugElement.query(By.css('.idp-menu-button'));
        menuButton.triggerEventHandler('click');
        menuTrigger = fixture.debugElement.query(By.directive(MatMenuTrigger)).injector.get(MatMenuTrigger);
        menuTrigger.openMenu();
        fixture.detectChanges();

        const menuContainerElement = fixture.debugElement.query(By.css('.idp-menu-item-container'));
        expect(menuContainerElement).not.toBeNull();
        const labelElement = menuContainerElement.nativeElement.querySelector('.idp-menu-item-container__label');
        expect(labelElement).not.toBeNull();

        expect(component.toolbarItem).not.toBeNull();
        const toolbarItem = component.toolbarItem as ToolbarItem;
        expect(toolbarItem.type).toEqual(ToolbarItemTypes.LayoutChange);
        expect(toolbarItem.enabled).toEqual(true);
        expect(toolbarItem.subItems).not.toBeNull();
        const subItems = toolbarItem.subItems as { [key: string]: { enabled: boolean } };
        const gridSubItem = subItems['grid'];
        const verticalSubItem = subItems['vertical_scrolling'];
        const horizontalSubItem = subItems['horizontal_scrolling'];
        expect(gridSubItem?.enabled).toBeFalse();
        expect(verticalSubItem?.enabled).toBeFalse();
        expect(horizontalSubItem?.enabled).toBeFalse();
    });

    it('should call onMenuItemClick when a menu item is clicked', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.LayoutChange);
        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        component.onMenuItemClick = jasmine.createSpy('onMenuItemClick');
        const menuButton = fixture.debugElement.query(By.css('.idp-menu-button'));
        menuButton.triggerEventHandler('click');
        menuTrigger = fixture.debugElement.query(By.directive(MatMenuTrigger)).injector.get(MatMenuTrigger);
        menuTrigger.openMenu();
        fixture.detectChanges();

        const menuItem = fixture.debugElement.query(By.css('.idp-menu-item-button'));
        menuItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        fixture.detectChanges();

        expect(component.onMenuItemClick).toHaveBeenCalled();
    });

    it('should select the correct subitem when a menu item grid layout is clicked', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.LayoutChange);
        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const menuButton = fixture.debugElement.query(By.css('.idp-menu-button'));
        menuButton.triggerEventHandler('click');
        menuTrigger = fixture.debugElement.query(By.directive(MatMenuTrigger)).injector.get(MatMenuTrigger);
        menuTrigger.openMenu();
        fixture.detectChanges();

        const menuItem = fixture.debugElement.query(By.css('#Grid'));
        menuItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        fixture.detectChanges();

        const layoutType = userLayoutOptionsFromString('Grid');
        const service = TestBed.inject(ViewerService);
        expect(service.changeUserSelectedLayout).toHaveBeenCalledWith(layoutType);
    });

    it('should select the correct subitem when a menu item horizontal layout is clicked', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.LayoutChange);
        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const menuButton = fixture.debugElement.query(By.css('.idp-menu-button'));
        menuButton.triggerEventHandler('click');
        menuTrigger = fixture.debugElement.query(By.directive(MatMenuTrigger)).injector.get(MatMenuTrigger);
        menuTrigger.openMenu();
        fixture.detectChanges();

        const menuItem = fixture.debugElement.query(By.css('#Single_Horizontal'));
        menuItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        fixture.detectChanges();

        const layoutType = userLayoutOptionsFromString('Single_Horizontal');
        const service = TestBed.inject(ViewerService);
        expect(service.changeUserSelectedLayout).toHaveBeenCalledWith(layoutType);
    });

    it('should call onToolbarAction when FullScreen toolbar button is clicked', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.FullScreen);
        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        component.onToolbarAction = jasmine.createSpy('onToolbarAction');
        const toolbarButton = fixture.debugElement.query(By.css('#FullScreen'));
        toolbarButton.triggerEventHandler('click');
        fixture.detectChanges();

        expect(component.onToolbarAction).toHaveBeenCalled();
    });

    it('should change fullscreen state when FullScreen toolbar action is triggered', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.FullScreen);
        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const service = TestBed.inject(ViewerService);
        component.onToolbarAction(item);
        fixture.detectChanges();

        const newFullScreen = !component.currentViewerState?.fullscreen;
        expect(service.changeViewerState).toHaveBeenCalledWith(
            { fullscreen: newFullScreen },
            newFullScreen ? EventTypes.FullScreenEnter : EventTypes.FullScreenExit
        );
    });

    it('should call onToolbarAction when Rotate toolbar button is clicked', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Rotate);
        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        component.onToolbarAction = jasmine.createSpy('onToolbarAction');
        const toolbarButton = fixture.debugElement.query(By.css('#Rotate'));
        toolbarButton.triggerEventHandler('click');
        fixture.detectChanges();

        expect(component.onToolbarAction).toHaveBeenCalled();
    });

    it('should rotate the document when Rotate toolbar action is triggered', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.Rotate);
        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true, config: { step: 90 } };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const service = TestBed.inject(ViewerService);
        component.onToolbarAction(item);
        fixture.detectChanges();

        const newRotation = (component.currentViewerState?.rotationStep || 0) % 360;
        expect(service.changeViewerState).toHaveBeenCalledWith({ rotationStep: newRotation }, EventTypes.RotationChanged);
    });

    it('should call onToolbarAction when BestFit toolbar button is clicked', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.BestFit);
        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        component.onToolbarAction = jasmine.createSpy('onToolbarAction');
        const toolbarButton = fixture.debugElement.query(By.css('#BestFit'));
        toolbarButton.triggerEventHandler('click');
        fixture.detectChanges();

        expect(component.onToolbarAction).toHaveBeenCalled();
    });

    it('should toggle best fit state when BestFit toolbar action is triggered', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.BestFit);
        fixture = TestBed.createComponent(GenericControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const service = TestBed.inject(ViewerService);
        component.onToolbarAction(item);
        fixture.detectChanges();

        const newBestFit = !component.currentViewerState?.bestFit;
        expect(service.changeViewerState).toHaveBeenCalledWith({ bestFit: newBestFit }, EventTypes.Resize);
    });
});
