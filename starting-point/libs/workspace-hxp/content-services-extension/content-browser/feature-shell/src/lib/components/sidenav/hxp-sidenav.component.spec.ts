/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HxpSidenavComponent } from './hxp-sidenav.component';
import { SidenavExpansionService } from '@hxp/workspace-hxp/shared/services';
import { MockProvider } from 'ng-mocks';
import { DocumentService, DocumentRouterService } from '@alfresco/adf-hx-content-services/services';
import { Subject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { FolderIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { NavigationEnd, Router } from '@angular/router';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { mockHxcsJsClientConfigurationService, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconTestingModule } from '@angular/material/icon/testing';

@Component({
    standalone: true,
    selector: 'hxp-workspace-document-tree',
    template: '<div></div>',
})
export class MockHxpDocumentTreeComponent {
    @Input() documents: Document;
}

class MockRouter {
    public events = new Subject<any>();
    public url = '/';

    navigate(url: string) {
        this.url = url;
        return Promise.resolve(true);
    }
}

class MockDocumentService {
    public documentLoaded$ = new Subject<Document>();
}

class MockSidenavExpansionService {
    isSideNavExpanded() {
        return true;
    }
}

describe('HxpSidenavComponent', () => {
    let component: HxpSidenavComponent;
    let fixture: ComponentFixture<HxpSidenavComponent>;
    let router: MockRouter;
    let documentService: MockDocumentService;
    let sidenavExpansionService: MockSidenavExpansionService;
    let documentRouterService: DocumentRouterService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                FolderIconComponent,
                NoopTranslateModule,
                MatExpansionModule,
                BrowserAnimationsModule,
                MatIconTestingModule,
                HxpSidenavComponent,
                MockHxpDocumentTreeComponent,
            ],
            providers: [
                mockHxcsJsClientConfigurationService,
                SidenavExpansionService,
                ChangeDetectorRef,
                MockProvider(DocumentRouterService, {
                    navigateTo: jasmine.createSpy(),
                }),
                { provide: Router, useClass: MockRouter },
                { provide: DocumentService, useClass: MockDocumentService },
                {
                    provide: SidenavExpansionService,
                    useClass: MockSidenavExpansionService,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HxpSidenavComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router) as unknown as MockRouter;
        documentService = TestBed.inject(DocumentService) as unknown as MockDocumentService;
        sidenavExpansionService = TestBed.inject(SidenavExpansionService);
        documentRouterService = TestBed.inject(DocumentRouterService);

        fixture.detectChanges();
    });

    afterEach(() => {
        documentService.documentLoaded$.complete();
    });

    it('should initialize with the correct state', () => {
        expect(component['isSideNavExpanded']).toBeTrue();
        expect(component['document']).toBeNull();
        expect(component['isContentBrowserRouteActive']).toBeFalse();
    });

    it('should update the document when a new document is loaded', () => {
        const mockDocument: Document = mocks.fileDocument;
        documentService.documentLoaded$.next(mockDocument);
        fixture.detectChanges();

        expect(component['document']).toEqual(mockDocument);
    });

    it('should navigate to root document', waitForAsync(() => {
        component.navigateToRoot();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(documentRouterService.navigateTo).toHaveBeenCalledWith(ROOT_DOCUMENT);
        });
    }));

    it('should navigate to a specific document', waitForAsync(() => {
        const mockDocument: Document = mocks.fileDocument;
        component.navigateToDocument(mockDocument);
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(documentRouterService.navigateTo).toHaveBeenCalledWith(mockDocument);
        });
    }));

    it('should detect route changes and update state accordingly', () => {
        router.events.next(new NavigationEnd(1, '/documents', '/documents'));
        fixture.detectChanges();
        expect(component['isContentBrowserRouteActive']).toBeTrue();

        router.events.next(new NavigationEnd(1, '/other-route', '/other-route'));
        fixture.detectChanges();
        expect(component['isContentBrowserRouteActive']).toBeFalse();
    });

    it('should return correct expansion state', () => {
        component.data = { state: 'expanded' };
        expect(component.isExpanded()).toBeTrue();

        component.data = { state: 'collapsed' };
        expect(component.isExpanded()).toBeFalse();
    });

    it('should initialize with the correct expansion state from the service', () => {
        const isExpanded = sidenavExpansionService.isSideNavExpanded();
        expect(component['isSideNavExpanded']).toBe(isExpanded);
    });
});
