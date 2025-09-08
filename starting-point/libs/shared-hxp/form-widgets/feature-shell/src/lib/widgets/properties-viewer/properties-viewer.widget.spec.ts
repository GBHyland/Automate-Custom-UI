/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { PropertiesViewerWidgetComponent } from './properties-viewer.widget';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorWidgetComponent, FormEvent, FormFieldModel, FormModel, FormService, NoopTranslateModule } from '@alfresco/adf-core';
import { MockComponent, MockProvider } from 'ng-mocks';
import { Subject, of } from 'rxjs';
import { DOCUMENT_MOCK, DOCUMENT_PROPERTIES_MOCK } from '../../mocks/document.mock';
import { FormWidgetService } from '../../services/form-widget/form-widget.service';
import { CommonModule } from '@angular/common';
import { PropertiesViewerContainerComponent } from '@alfresco/adf-hx-content-services/ui';
import { By } from '@angular/platform-browser';
import { DOCUMENT_SERVICE, DOCUMENT_PROPERTIES_SERVICE } from '@alfresco/adf-hx-content-services/services';

describe('PropertiesViewerWidgetComponent', () => {
    let component: PropertiesViewerWidgetComponent;
    let fixture: ComponentFixture<PropertiesViewerWidgetComponent>;
    let refreshSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule, NoopTranslateModule],
            declarations: [PropertiesViewerWidgetComponent, MockComponent(ErrorWidgetComponent), MockComponent(PropertiesViewerContainerComponent)],
            providers: [
                MockProvider(FormService, {
                    formDataRefreshed: new Subject<FormEvent>(),
                }),
                MockProvider(DOCUMENT_PROPERTIES_SERVICE, {
                    getPropertiesFromDocument: () => of([]),
                    getDefaultPropertiesFromDocument: () => of(DOCUMENT_PROPERTIES_MOCK),
                }),
                MockProvider(DOCUMENT_SERVICE, {
                    getDocumentById: () => of(DOCUMENT_MOCK),
                }),
                MockProvider(FormWidgetService, {
                    getDocumentFromField: (field) => {
                        return field.value ? of(DOCUMENT_MOCK) : of(null);
                    },
                }),
            ],
        });

        fixture = TestBed.createComponent(PropertiesViewerWidgetComponent);
        component = fixture.componentInstance;
        refreshSpy = spyOn(component, 'refresh').and.callThrough();
        fixture.componentRef.setInput(
            'field',
            new FormFieldModel(new FormModel(), {
                id: 'fakeField',
                value: null,
                params: {
                    propertiesViewerOptions: {
                        copyToClipboardAction: true,
                        displayDefaultProperties: true,
                        displayEmpty: true,
                        editable: true,
                        expanded: true,
                        multi: true,
                        useChipsForMultiValueProperty: true,
                    },
                },
            })
        );
    });

    it('should show hxp-properties-viewer-container only when data is loaded', () => {
        fixture.componentRef.setInput('field', { ...component.field, value: null });
        component.fieldChanged.emit(component.field);
        fixture.detectChanges();

        let propertiesViewer = fixture.nativeElement.querySelector('hxp-properties-viewer-container');
        let adfPreviewPlaceholder = fixture.nativeElement.querySelector('.adf-preview-placeholder');

        expect(propertiesViewer).toBeNull();
        expect(adfPreviewPlaceholder).toBeTruthy();

        fixture.componentRef.setInput('field', { ...component.field, value: DOCUMENT_MOCK });
        component.fieldChanged.emit(component.field);
        fixture.detectChanges();

        propertiesViewer = fixture.nativeElement.querySelector('hxp-properties-viewer-container');
        adfPreviewPlaceholder = fixture.nativeElement.querySelector('.adf-preview-placeholder');

        expect(propertiesViewer).not.toBeNull();
        expect(adfPreviewPlaceholder).toBeNull();
    });

    describe('when form data is refreshed', () => {
        const refreshFormData = () => {
            component.formService?.formDataRefreshed.next(
                new FormEvent({
                    fieldsCache: [
                        {
                            id: 'fakeAttachFileWidget',
                            value: DOCUMENT_MOCK,
                        },
                    ],
                })
            );
        };

        it('should update field value and call refresh, when linked to attach file widget', () => {
            component.field.params['hxpUploadWidget'] = 'fakeAttachFileWidget';
            fixture.detectChanges();

            refreshFormData();
            fixture.detectChanges();

            expect(component.field.value).toEqual(DOCUMENT_MOCK);
            expect(refreshSpy).toHaveBeenCalled();
        });

        it('should not update field value and call refresh if not linked to attach file widget', () => {
            component.field.params['hxpUploadWidget'] = null;
            fixture.detectChanges();

            refreshFormData();
            fixture.detectChanges();

            expect(component.field.value).toBeNull();
            expect(refreshSpy).not.toHaveBeenCalled();
        });
    });

    describe('when refresh is called', () => {
        it('should emit fieldChanged with the current value of field', (done) => {
            component.fieldChanged.subscribe((field) => {
                expect(field).toEqual(component.field);
                done();
            });

            component.field.value = DOCUMENT_MOCK;
            component.refresh();
        });

        it('should data$ emit null if field value is null', (done) => {
            component.data$.subscribe((data) => {
                expect(data).toBeNull();
                done();
            });

            component.field.value = null;
            component.refresh();
        });

        it('should data$ emit PropertiesViewerContainerData if field value contains a ContentReference', (done) => {
            component.data$.subscribe((data) => {
                expect(data).toEqual({
                    document: DOCUMENT_MOCK,
                    defaultProperties: DOCUMENT_PROPERTIES_MOCK,
                    otherProperties: [],
                });
                done();
            });

            component.field.value = DOCUMENT_MOCK;
            component.refresh();
        });

        it('should not render any PropertiesViewerContainer component if data is null', () => {
            component.data$ = of(null);
            fixture.detectChanges();

            const propertiesViewerContainerComponents = fixture.nativeElement.querySelectorAll('hxp-properties-viewer-container');

            expect(propertiesViewerContainerComponents.length).toBe(0);
        });

        it('should one PropertiesViewerContainer component be rendered with default properties only', () => {
            component.data$ = of({
                document: DOCUMENT_MOCK,
                defaultProperties: DOCUMENT_PROPERTIES_MOCK,
                otherProperties: [],
            });
            fixture.detectChanges();

            const propertiesViewerContainerComponents = fixture.debugElement.queryAll(By.directive(PropertiesViewerContainerComponent));

            expect(propertiesViewerContainerComponents.length).toBe(1);
            expect(propertiesViewerContainerComponents[0].attributes['headerText']).toBe('DOCUMENT.PROPERTIES.VIEWER.MAIN.CONTAINER.HEADER');
        });

        it('should two PropertiesViewerContainer components be rendered with default and other properties', () => {
            component.data$ = of({
                document: DOCUMENT_MOCK,
                defaultProperties: DOCUMENT_PROPERTIES_MOCK,
                otherProperties: DOCUMENT_PROPERTIES_MOCK,
            });
            fixture.detectChanges();

            const propertiesViewerContainerComponents = fixture.debugElement.queryAll(By.directive(PropertiesViewerContainerComponent));

            expect(propertiesViewerContainerComponents.length).toBe(2);
            expect(propertiesViewerContainerComponents[0].attributes['headerText']).toBe('DOCUMENT.PROPERTIES.VIEWER.MAIN.CONTAINER.HEADER');
            expect(propertiesViewerContainerComponents[1].attributes['headerText']).toBe('DOCUMENT.PROPERTIES.VIEWER.OTHER.CONTAINER.HEADER');
        });
    });
});
