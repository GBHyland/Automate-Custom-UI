/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RelatedProcessComponent } from './related-process.component';
import { RelatedProcessContext } from '../../models/related-process.model';

describe('RelatedProcessComponent', () => {
    let component: RelatedProcessComponent;
    let fixture: ComponentFixture<RelatedProcessComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RelatedProcessComponent, NoopAnimationsModule, NoopTranslateModule],
        }).compileComponents();

        fixture = TestBed.createComponent(RelatedProcessComponent);
        component = fixture.componentInstance;
    });

    it('should show subprocesses count equal to 1 if it has one subprocess', () => {
        const mockContext = {
            row: {
                obj: {
                    id: '123',
                    name: 'Process Name',
                    subprocesses: [
                        {
                            id: '456',
                            processDefinitionName: 'Subprocess Name',
                        },
                    ],
                },
            },
        };

        component.context = mockContext;

        fixture.detectChanges();

        const parentProcessElement: HTMLElement = fixture.debugElement.nativeElement.querySelector(
            '[data-automation-id="apa-process-list-related-parent-process"]'
        );

        expect(parentProcessElement.textContent.trim()).toEqual('1 PROCESS_CLOUD_EXTENSION.PROCESS_LIST.PROPERTIES.SUBPROCESS');
    });

    it('should show subprocesses count equal to 2 if it has two subprocesses', () => {
        const mockContext = {
            row: {
                obj: {
                    id: '123',
                    name: 'Process Name',
                    subprocesses: [
                        {
                            id: '456',
                            processDefinitionName: 'Subprocess Name',
                        },
                        {
                            id: '789',
                            processDefinitionName: 'Subprocess Name',
                        },
                    ],
                },
            },
        };

        component.context = mockContext;

        fixture.detectChanges();

        const parentProcessElement: HTMLElement = fixture.debugElement.nativeElement.querySelector(
            '[data-automation-id="apa-process-list-related-parent-process"]'
        );

        expect(parentProcessElement.textContent.trim()).toEqual('2 PROCESS_CLOUD_EXTENSION.PROCESS_LIST.PROPERTIES.SUBPROCESSES');
    });

    it('should show tooltip with subprocesses names and ids', () => {
        const mockContext = {
            row: {
                obj: {
                    id: '123',
                    name: 'Process Name',
                    subprocesses: [
                        {
                            id: '456',
                            processDefinitionName: 'Subprocess 1 Name',
                        },
                        {
                            id: '789',
                            processDefinitionName: 'Subprocess 2 Name',
                        },
                    ],
                },
            },
        };

        component.context = mockContext;

        fixture.detectChanges();

        const parentProcessElement: HTMLElement = fixture.debugElement.nativeElement.querySelector(
            '[data-automation-id="apa-process-list-related-parent-process"]'
        );

        parentProcessElement.dispatchEvent(new MouseEvent('mouseenter'));

        fixture.detectChanges();

        const tooltipElementContent = document.body.querySelector('.adf-tooltip-card-content');

        const tooltipHeaderElement = tooltipElementContent?.querySelector('.apa-process-list-related-process-header');
        expect(tooltipHeaderElement?.textContent?.trim()).toEqual('PROCESS_CLOUD_EXTENSION.PROCESS_LIST.TOOLTIP.HEADER');

        const subprocessesItems = tooltipElementContent?.querySelectorAll('.apa-process-list-related-process-child');
        if (subprocessesItems && subprocessesItems.length === 2) {
            const firstSubprocessDefinitionName = subprocessesItems[0]
                .querySelector('.apa-process-list-related-process-child-name')
                ?.textContent?.trim();
            const firstSubprocessId = subprocessesItems[0].querySelector('.apa-process-list-related-process-child-id')?.textContent?.trim();
            expect(firstSubprocessDefinitionName).toEqual('Subprocess 1 Name');
            expect(firstSubprocessId).toEqual('(id: 456)');

            const secondSubprocessDefinitionName = subprocessesItems[1]
                .querySelector('.apa-process-list-related-process-child-name')
                ?.textContent?.trim();
            const secondSubprocessId = subprocessesItems[1].querySelector('.apa-process-list-related-process-child-id')?.textContent?.trim();
            expect(secondSubprocessDefinitionName).toEqual('Subprocess 2 Name');
            expect(secondSubprocessId).toEqual('(id: 789)');
        } else {
            fail('Expected two subprocesses items');
        }

        const tooltipHeaderInnerHTML = tooltipElementContent?.innerHTML.split('<br>')[0];
        expect(tooltipHeaderInnerHTML).toEqual(
            `<span class="apa-process-list-related-process-header">PROCESS_CLOUD_EXTENSION.PROCESS_LIST.TOOLTIP.HEADER</span>:`
        );

        const tooltipContentInnerHTML = tooltipElementContent?.innerHTML.split('<br>')[1];
        expect(tooltipContentInnerHTML).toEqual(
            // eslint-disable-next-line max-len
            `<ul><li class="apa-process-list-related-process-child"><span class="apa-process-list-related-process-child-name">Subprocess 1 Name</span><span class="apa-process-list-related-process-child-id">(id: 456)</span></li><li class="apa-process-list-related-process-child"><span class="apa-process-list-related-process-child-name">Subprocess 2 Name</span><span class="apa-process-list-related-process-child-id">(id: 789)</span></li></ul>`
        );
    });

    it('should show parent process name and id', () => {
        const mockContext = {
            row: {
                obj: {
                    id: '123',
                    name: 'Process 666 Name',
                    parentId: 'this-is-parent-id',
                },
            },
        } as RelatedProcessContext;

        component.context = mockContext;

        fixture.detectChanges();

        const subprocessElement: HTMLElement = fixture.debugElement.nativeElement.querySelector(
            '[data-automation-id="apa-process-list-related-subprocess"]'
        );

        expect(subprocessElement.textContent.trim()).toEqual(`Process 666 Name (id:this-is-parent-id)`);
    });

    it('should show tooltip with parent process name and id', async () => {
        const mockContext = {
            row: {
                obj: {
                    id: '123',
                    name: 'Process 555 Name',
                    parentId: 'this-is-an-amazing-parent-id',
                },
            },
        };

        component.context = mockContext;

        fixture.detectChanges();

        const subprocessElement: HTMLElement = fixture.debugElement.nativeElement.querySelector(
            '[data-automation-id="apa-process-list-related-subprocess"]'
        );

        subprocessElement.dispatchEvent(new MouseEvent('mouseenter'));

        fixture.detectChanges();

        const tooltipElementContent: HTMLElement = document.body.querySelector('.adf-tooltip-card-content');

        expect(tooltipElementContent.innerHTML.trim()).toEqual(`Process 555 Name<br>(id: this-is-an-amazing-parent-id)`);
    });

    it('should not display related processes if none exist', () => {
        const mockContext = {
            row: {
                obj: {
                    id: '123',
                    name: 'Process Name',
                },
            },
        };

        component.context = mockContext;

        fixture.detectChanges();

        const parentProcessElement: HTMLElement = fixture.debugElement.nativeElement.querySelector(
            '[data-automation-id="apa-process-list-related-parent-process"]'
        );

        const subprocessElement: HTMLElement = fixture.debugElement.nativeElement.querySelector(
            '[data-automation-id="apa-process-list-related-subprocess"]'
        );

        expect(parentProcessElement).toBeNull();
        expect(subprocessElement).toBeNull();
    });

    it('should not display related processes when there are no process instances', () => {
        const mockContext = undefined;

        component.context = mockContext;

        fixture.detectChanges();

        const parentProcessElement: HTMLElement = fixture.debugElement.nativeElement.querySelector(
            '[data-automation-id="apa-process-list-related-parent-process"]'
        );

        const subprocessElement: HTMLElement = fixture.debugElement.nativeElement.querySelector(
            '[data-automation-id="apa-process-list-related-subprocess"]'
        );

        expect(parentProcessElement).toBeNull();
        expect(subprocessElement).toBeNull();
    });
});
