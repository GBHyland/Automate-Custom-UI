/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { PlaywrightBase } from '../playwright-base';
import { timeouts } from '../../utils/timeouts';

export interface LocatorBounding {
    x: number;
    y: number;
    width: number;
    height: number;
}
export type ElementPositionOffset = 'middle' | 'bottom' | 'top' | 'left' | 'right';
export interface PixelMoveOptions {
    direction: string;
    pixels: number;
}
export interface DragAndDropOptions {
    elementToMoveOffset?: ElementPositionOffset;
    elementToDropOnOffset?: ElementPositionOffset;
    additionalPixelOffset?: PixelMoveOptions;
}

export interface PeopleOrGroupComponentDetails {
    page: Page;
    parentRootElement?: string;
    role?: string;
}

export abstract class BaseComponent extends PlaywrightBase {
    private rootElement: string;
    private overlayElement = this.page.locator('.cdk-overlay-backdrop-showing');
    overlayBoxElement = this.page.locator('.cdk-overlay-connected-position-bounding-box');

    constructor(page: Page, rootElement: string) {
        super(page);
        this.rootElement = rootElement;
    }

    get getRootLocator(): Locator {
        return this.page.locator(this.rootElement);
    }

    get rootElementString() {
        return this.rootElement;
    }

    getButtonByExactText = (text: string) => this.getChild(`button`).getByText(`${text}`, { exact: true });
    getButtonByText = (text: string) => this.getChild(`button`).getByText(`${text}`);
    getElementByAutomationId = (id: string) => this.getChild(`[data-automation-id='${id}']`);
    getElementByIdAndLocator = (id: string, locator: Locator) => this.getChild(`[data-automation-id='${id}']`, { has: locator });
    getButtonByNameLocator = (name: string) => this.getChild('button', { hasText: name });
    getElementByNameLocator = (id: string, name: string) => this.getChild(`[data-automation-id='${id}']`, { hasText: name });
    getFormFieldByIdLocator = (id: string) => this.getChild(`#${id}`);
    /**
     * Method which should be used across the repository, while creating
     * reference to elements, which are in root element of component.
     * @param cssLocator css selector as String. Need to be in the tree under the root element
     * @param options if you want to localize it by text, then provide an optional hasText
     * @returns Locator object
     */
    getChild(cssLocator: string = '', options?: { hasText?: string | RegExp; has?: Locator }): Locator {
        return this.page.locator(`${this.rootElement} ${cssLocator}`, options);
    }

    async waitForRootElement(): Promise<void> {
        await this.getChild().waitFor({ state: 'visible' });
    }

    protected async delay(timeout = 500) {
        await this.page.waitForTimeout(timeout);
    }

    async closeAdditionalOverlayElementIfVisible(): Promise<void> {
        if (await this.overlayElement.isVisible()) {
            await this.page.keyboard.press('Escape');
            await this.overlayElement.waitFor({ state: 'detached', timeout: timeouts.medium });
        }
    }

    async spinnerWaitForReload(
        // eslint-disable-next-line @alfresco/eslint-angular/no-angular-material-selectors
        spinnerLocator = '.mat-mdc-progress-spinner',
        attachTimeout = timeouts.short,
        detachTimeout = timeouts.large
    ): Promise<void> {
        try {
            await this.page.locator(spinnerLocator).last().waitFor({ state: 'attached', timeout: attachTimeout });
            await this.page.locator(spinnerLocator).last().waitFor({ state: 'detached', timeout: detachTimeout });
        } catch {
            /* do nothing */
        }
    }

    async waitForSkeletonLoader(): Promise<void> {
        const skeletonTableLocator = `${this.rootElementString} table[class$=-skeleton-table]`;
        await this.spinnerWaitForReload(skeletonTableLocator, timeouts.default);
    }

    async mouseDragAndDrop(elementToMove: Locator, elementToDropOn: Locator, dragAndDropOptions?: DragAndDropOptions): Promise<void> {
        const params: DragAndDropOptions = {
            elementToMoveOffset: 'middle',
            elementToDropOnOffset: 'middle',
            ...dragAndDropOptions,
        };
        const elementToMoveBounding = await elementToMove.boundingBox();
        const elementToMovePosition = this.getElementPosition(elementToMoveBounding, params.elementToMoveOffset);
        await this.page.mouse.move(elementToMovePosition.x, elementToMovePosition.y);
        await this.page.mouse.down();
        await this.page.mouse.move(elementToMovePosition.x + 5, elementToMovePosition.y + 5);

        const elementToDropOnBounding = await elementToDropOn.boundingBox();
        const elementToDropOnPosition = this.getElementPosition(elementToDropOnBounding, params.elementToDropOnOffset);
        await this.page.mouse.move(elementToDropOnPosition.x, elementToDropOnPosition.y);

        if (params.additionalPixelOffset) {
            const position = this.getOffsetPosition(
                elementToDropOnPosition,
                params.additionalPixelOffset.pixels,
                params.additionalPixelOffset.direction
            );
            await this.page.mouse.move(position.x, position.y);
        }
        await this.page.mouse.up();
    }

    async mouseDragAndDropByPixels(elementToMove: Locator, offset: ElementPositionOffset, pixels: number, direction: string): Promise<void> {
        const elementToMoveBounding = await elementToMove.boundingBox();
        const elementToMovePosition = this.getElementPosition(elementToMoveBounding, offset);
        const position = this.getOffsetPosition(elementToMovePosition, pixels, direction);
        await this.page.mouse.move(elementToMovePosition.x, elementToMovePosition.y);
        await this.page.mouse.down();
        await this.page.mouse.move(position.x, position.y);
        await this.page.mouse.up();
    }

    private getOffsetPosition(elementToMove: { x: number; y: number }, pixels: number, direction: string): { x: number; y: number } {
        const destinationPosition = {
            x: elementToMove.x,
            y: elementToMove.y,
        };
        switch (direction) {
            case 'up': {
                destinationPosition.y = elementToMove.y - pixels;
                break;
            }
            case 'down': {
                destinationPosition.y = elementToMove.y + pixels;
                break;
            }
            case 'left': {
                destinationPosition.x = elementToMove.x - pixels;
                break;
            }
            case 'right': {
                destinationPosition.x = elementToMove.x + pixels;
                break;
            }
        }
        return destinationPosition;
    }

    getElementPosition(locatorBounding: LocatorBounding, position: ElementPositionOffset): { x: number; y: number } {
        const middleOfElement = this.getMiddleOfTheElementPosition(locatorBounding);
        switch (position) {
            case 'top': {
                return { x: middleOfElement.x, y: middleOfElement.y - Math.floor(locatorBounding.height / 2) };
            }
            case 'bottom': {
                return { x: middleOfElement.x, y: middleOfElement.y + Math.floor(locatorBounding.height / 2) };
            }
            case 'left': {
                return { x: middleOfElement.x - Math.floor(locatorBounding.width / 2), y: middleOfElement.y };
            }
            case 'right': {
                return { x: middleOfElement.x + Math.floor(locatorBounding.width / 2), y: middleOfElement.y };
            }
            default: {
                return middleOfElement;
            }
        }
    }

    getMiddleOfTheElementPosition(locatorBounding: LocatorBounding): { x: number; y: number } {
        return { x: locatorBounding.x + Math.floor(locatorBounding.width / 2), y: locatorBounding.y + Math.floor(locatorBounding.height / 2) };
    }

    async closeOverlays(numberOfOverlays: number = 1): Promise<void> {
        for (let i = 0; i < numberOfOverlays; i++) {
            await this.page.keyboard.press('Escape');
        }
    }

    async getBody() {
        return this.page.locator('body');
    }
}
