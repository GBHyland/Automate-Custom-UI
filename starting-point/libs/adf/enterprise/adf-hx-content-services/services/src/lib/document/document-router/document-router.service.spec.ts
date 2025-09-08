/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DocumentRouterService } from './document-router.service';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { RouterTestingModule } from '@angular/router/testing';
import { DEFAULT_REPOSITORY_ID } from '@alfresco/adf-hx-content-services/api';

describe('DocumentRouterService', () => {
    let service: DocumentRouterService;
    let router: Router;
    const routerSpy = {
        createUrlTree: jest.fn(),
        serializeUrl: jest.fn(),
        navigateByUrl: jest.fn(),
    };
    const locationSpy = {
        prepareExternalUrl: jest.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RouterTestingModule, { provide: Router, useValue: routerSpy }, { provide: Location, useValue: locationSpy }],
        });

        service = TestBed.inject(DocumentRouterService);
        router = TestBed.inject(Router);
    });

    const testCases = [
        {
            repositoryId: DEFAULT_REPOSITORY_ID,
            document: {
                sys_id: '123',
                sys_parentId: '456',
            } as Document,
        },
        {
            repositoryId: 'customRepositoryId',
            document: {
                sys_repository: 'customRepositoryId',
                sys_id: '123',
                sys_parentId: '456',
            } as Document,
        },
    ];

    testCases.forEach(({ repositoryId, document }) => {
        it(`should return relative URL for Document object with default options and repository id ${repositoryId}`, () => {
            const expectedUrlTree = {};
            const expectedUrl = `/${repositoryId}/documents/123`;

            routerSpy.createUrlTree.mockReturnValue(expectedUrlTree as any);
            routerSpy.serializeUrl.mockReturnValue(expectedUrl);

            const result = service.urlFor(document);

            expect(result).toBe(expectedUrl);
        });

        it(`should return absolute URL for Document object and repository id ${repositoryId}`, () => {
            const expectedUrlTree = {};
            const relativeUrl = `/${repositoryId}/documents`;
            const expectedFullUrl = `http://localhost/${repositoryId}/documents/123`;

            routerSpy.createUrlTree.mockReturnValue(expectedUrlTree as any);
            routerSpy.serializeUrl.mockReturnValue(relativeUrl);
            locationSpy.prepareExternalUrl.mockReturnValue(relativeUrl);

            const result = service.urlFor(document, { absolute: true });

            expect(result).toBe(expectedFullUrl);
        });

        it(`should return relative URL for parent document and repository id ${repositoryId}`, () => {
            const expectedUrlTree = {};
            const expectedUrl = `/${repositoryId}/documents/456`;

            routerSpy.createUrlTree.mockReturnValue(expectedUrlTree as any);
            routerSpy.serializeUrl.mockReturnValue(expectedUrl);

            const result = service.urlForParent(document);

            expect(result).toBe(expectedUrl);
        });

        it(`should return absolute URL for parent document and repository id ${repositoryId}`, () => {
            const expectedUrlTree = {};
            const relativeUrl = `/${repositoryId}/documents`;
            const expectedFullUrl = `http://localhost/${repositoryId}/documents/456`;

            routerSpy.createUrlTree.mockReturnValue(expectedUrlTree as any);
            routerSpy.serializeUrl.mockReturnValue(relativeUrl);
            locationSpy.prepareExternalUrl.mockReturnValue(relativeUrl);

            const result = service.urlForParent(document, { absolute: true });

            expect(result).toBe(expectedFullUrl);
        });

        it(`should navigate to the given Document object and repository id ${repositoryId}`, () => {
            const expectedUrl = `/${repositoryId}/documents/123`;

            jest.spyOn(service, 'urlFor').mockReturnValue(expectedUrl);

            service.navigateTo(document);

            expect(service.urlFor).toHaveBeenCalledWith(document);
            expect(router.navigateByUrl).toHaveBeenCalledWith(expectedUrl, undefined);
        });
    });
});
