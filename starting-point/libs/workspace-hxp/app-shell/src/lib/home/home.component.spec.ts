/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HomeComponent } from './home.component';
import { AppConfigService, AppConfigServiceMock, ToolbarModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { DocumentRouterService } from '@alfresco/adf-hx-content-services/services';

describe('HomeComponent', () => {
    let appConfig: AppConfigService;
    let documentRouterService: DocumentRouterService;
    let fixture: ComponentFixture<HomeComponent>;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, ToolbarModule],
            providers: [{ provide: AppConfigService, useClass: AppConfigServiceMock }],
        });

        fixture = TestBed.createComponent(HomeComponent);
        router = TestBed.inject(Router);
        appConfig = TestBed.inject(AppConfigService);
        documentRouterService = TestBed.inject(DocumentRouterService);
        appConfig.config = Object.assign(appConfig.config, {
            landingPage: '/my-mock-landing-page',
        });
        localStorage.removeItem('contentService');
    });

    it('should navigate to the landing page from the app config', () => {
        const navigateSpy = spyOn(router, 'navigateByUrl');
        fixture.detectChanges();

        expect(navigateSpy).toHaveBeenCalledWith('/my-mock-landing-page');
    });

    it('should navigate to an empty string url by default when content services are disabled and no landingPage is defined', () => {
        localStorage.setItem('contentService', 'false');
        appConfig.config = {};
        const navigateSpy = spyOn(router, 'navigateByUrl');
        fixture.detectChanges();

        expect(navigateSpy).toHaveBeenCalledWith('');
    });

    it('should navigate to documents home url by default when content services are enabled and no landingPage is defined', () => {
        localStorage.setItem('contentService', 'true');
        appConfig.config = {};
        const navigateToSpy = spyOn(documentRouterService, 'navigateTo');

        fixture.detectChanges();

        expect(navigateToSpy).toHaveBeenCalledWith(ROOT_DOCUMENT);
    });
});
