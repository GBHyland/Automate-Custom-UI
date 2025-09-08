/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent, MockProvider, ngMocks } from 'ng-mocks';
import { DocumentLocationPickerComponent } from './document-location-picker.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { a11yReport, mocks } from '@hxp/workspace-hxp/shared/testing';
import { Subject, of } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { DocumentLocationPickerHarness } from './document-location-picker-harness';
import { HxpWorkspaceDocumentTreeComponent } from '@hxp/workspace-hxp/shared/workspace-document-tree';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { provideContentServicesExtensionContentBrowserFeatureShell } from '../../content-services-extension-content-browser-feature-shell.providers';
import { TranslatePipe } from '@ngx-translate/core';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [];

// Mocking the FocusMonitor as it doesn't work as expected in unit tests
// This allows us to manually control the focus monitor for the input element
class MockFocusMonitor {
    private value = false;
    private focus = new Subject();

    focusElement() {
        this.value = true;
        this.focus.next(this.value);
    }

    blurElement() {
        this.value = false;
        this.focus.next(this.value);
    }

    monitor() {
        return this.focus.asObservable();
    }
}

describe('DocumentLocationPickerComponent', () => {
    let component: DocumentLocationPickerComponent;
    let fixture: ComponentFixture<DocumentLocationPickerComponent>;
    let mockFocusMonitor: MockFocusMonitor;
    let loader: HarnessLoader;

    beforeEach(() => {
        mockFocusMonitor = new MockFocusMonitor();

        TestBed.configureTestingModule({
            imports: [
                TranslatePipe,
                NoopAnimationsModule,
                NoopTranslateModule,
                OverlayModule,
                DocumentLocationPickerComponent,
                MockComponent(HxpWorkspaceDocumentTreeComponent),
            ],
            providers: [
                provideContentServicesExtensionContentBrowserFeatureShell(),
                MockProvider(DocumentService, {
                    getFolderChildren: () =>
                        of({
                            documents: [...mocks.nestedDocumentAncestors],
                            limit: 10,
                            offset: 0,
                            totalCount: mocks.nestedDocumentAncestors.length,
                        }),
                    getAncestors: () => of([ROOT_DOCUMENT]),
                    documentCreated$: new Subject(),
                    documentDeleted$: new Subject(),
                    documentLoaded$: new Subject(),
                }),
                { provide: FocusMonitor, useValue: mockFocusMonitor },
            ],
        });

        fixture = TestBed.createComponent(DocumentLocationPickerComponent);
        component = fixture.componentInstance;
        component.ngOnChanges();
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    afterEach(async () => {
        const documentLocationHarness = await loader.getHarness(DocumentLocationPickerHarness);

        if (await documentLocationHarness?.isOverlayOpened()) {
            const backdrop = await documentLocationHarness.getOverlayBackdrop();
            await backdrop?.click();

            fixture.detectChanges();
            await fixture.whenStable();
        }
    });

    it('should display placeholder if no document location is provided', async () => {
        const documentLocationHarness = await loader.getHarness(DocumentLocationPickerHarness);
        const label = await documentLocationHarness.getLabel();
        const input = await documentLocationHarness.getInput();

        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('DOCUMENT_LOCATION_PICKER.LABEL');

        expect(input).toBeTruthy();
        expect(await input?.getPlaceholder()).toBe('...');
    });

    it('should display document location if one is provided as input', async () => {
        const documentLocationHarness = await loader.getHarness(DocumentLocationPickerHarness);
        const label = await documentLocationHarness.getLabel();
        let input = await documentLocationHarness.getInput();

        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('DOCUMENT_LOCATION_PICKER.LABEL');
        expect(input).toBeTruthy();
        expect(await input?.getPlaceholder()).toBe('...');

        component.document = mocks.folderDocument;
        component.ngOnChanges();
        fixture.detectChanges();

        input = await documentLocationHarness.getInput();

        expect(await input?.getPlaceholder()).toBe(mocks.folderDocument.sys_path);
    });

    it('should select a location when a new document is selected', async () => {
        const documentLocationHarness = await loader.getHarness(DocumentLocationPickerHarness);
        const baseLocation = mocks.folderDocument;
        const selectedLocation = mocks.nestedDocumentAncestors[1];

        component.document = baseLocation;
        component.ngOnChanges();
        fixture.detectChanges();

        const input = await documentLocationHarness.getInput();

        expect(input).toBeTruthy();
        expect(await input?.getPlaceholder()).toBe(baseLocation.sys_path);

        mockFocusMonitor.focusElement();

        fixture.detectChanges();

        expect(await documentLocationHarness.isOverlayOpened()).toBeTruthy();

        const mockDocumentTree = ngMocks.find<HxpWorkspaceDocumentTreeComponent>('hxp-workspace-document-tree').componentInstance;

        mockDocumentTree.selectedDocument.emit(selectedLocation);

        fixture.detectChanges();

        expect(await input?.getPlaceholder()).toBe(selectedLocation.sys_path);
        expect(await documentLocationHarness.isOverlayOpened()).toBeFalsy();
    });

    it('should not select a location if the widget loses focus', async () => {
        const baseLocation = mocks.folderDocument;

        component.document = baseLocation;
        component.ngOnChanges();
        fixture.detectChanges();

        const documentLocationHarness = await loader.getHarness(DocumentLocationPickerHarness);
        let input = await documentLocationHarness.getInput();

        expect(input).toBeTruthy();
        expect(await input?.getPlaceholder()).toBe(baseLocation.sys_path);

        mockFocusMonitor.focusElement();
        fixture.detectChanges();

        expect(await documentLocationHarness.isOverlayOpened()).toBeTruthy();

        mockFocusMonitor.blurElement();

        // lets simulate a click outside the overlay to hide it
        const backdrop = await documentLocationHarness.getOverlayBackdrop();
        expect(backdrop).toBeTruthy();
        backdrop?.dispatchEvent('click');

        fixture.detectChanges();
        await fixture.whenStable();

        expect(await documentLocationHarness.isOverlayOpened()).toBeFalsy();

        input = await documentLocationHarness.getInput();

        expect(await input?.getPlaceholder()).toBe(baseLocation.sys_path);
    });

    it('should pass accessibility checks', async () => {
        component.document = mocks.folderDocument;
        component.ngOnChanges();
        fixture.detectChanges();
        await fixture.whenStable();

        mockFocusMonitor.focusElement();
        fixture.detectChanges();
        await fixture.whenStable();

        const documentLocationPicker = await a11yReport('.hxp-document-location-picker');

        expect(documentLocationPicker?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
