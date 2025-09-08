/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DocumentMoreMenuItemsFactoryService } from './document-more-menu-items-factory.service';
import { ContentActionRef, ExtensionService } from '@alfresco/adf-extensions';
import { of, firstValueFrom } from 'rxjs';
import { FeaturesServiceToken } from '@alfresco/adf-core/feature-flags';
import { MockProvider } from 'ng-mocks';

const DOCUMENT_MORE_ACTION_REF = {
    id: 'app.document.more',
    type: 'menu',
    order: 10_000,
    icon: 'more_vert',
    title: 'APP.ACTIONS.MORE',
    children: [
        {
            id: 'document.move',
            order: 200,
            type: 'custom',
            component: 'document.move',
            rules: {
                visible: 'app.canShowMove',
            },
        },
        {
            id: 'document.create_version',
            order: 200,
            type: 'custom',
            component: 'document.create_version',
            rules: {
                featureFlag: 'workspace-versioning',
            },
        },
    ],
};

const EXTENSION_CONFIG = {
    $schema: '../../../extension.schema.json',
    $id: 'app.core',
    $name: 'app.core',
    $version: '0.0.1',
    $vendor: 'Alfresco Software, Ltd.',
    $license: 'LGPL-3.0',
    $runtime: '1.7.0',
    $description: 'Core application extensions and features',
    $references: [],
    $ignoreReferenceList: [],
    features: {
        header: [
            {
                id: 'app.header.more',
                type: 'menu',
                order: 10_000,
                icon: 'more_vert',
                title: 'APP.ACTIONS.MORE',
                children: [
                    {
                        id: 'app.logout',
                        order: 200,
                        type: 'custom',
                        component: 'app.logout',
                        rules: {
                            visible: 'app.canShowLogout',
                        },
                    },
                ],
            },
        ],
        document: [DOCUMENT_MORE_ACTION_REF],
    },
};

describe('DocumentMoreMenuItemsFactoryService', () => {
    let documentMoreMenuItemsFactoryService: DocumentMoreMenuItemsFactoryService;
    let extensionService: ExtensionService;
    const featuresServiceSpy = {
        isOn$: jest.fn().mockReturnValue(of(false)),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MockProvider(ExtensionService), { provide: FeaturesServiceToken, useValue: featuresServiceSpy }],
        });

        documentMoreMenuItemsFactoryService = TestBed.inject(DocumentMoreMenuItemsFactoryService);
        extensionService = TestBed.inject(ExtensionService);
        extensionService.setup$ = of(EXTENSION_CONFIG);
    });

    afterEach(() => {
        featuresServiceSpy.isOn$.mockClear();
    });

    it('should return an action ref of type "menu" with a child with id "document.move"', async () => {
        const actionRef: ContentActionRef = await firstValueFrom(documentMoreMenuItemsFactoryService.getMoreMenuItems());

        expect(actionRef.type).toEqual('menu');
        expect(actionRef.children?.length).toBeGreaterThan(0);

        const subActionRef = actionRef.children?.find((ref) => ref.id === 'document.move');

        expect(subActionRef).toBeDefined();
    });

    it('should return an action ref of type "menu" with a child with id "document.create_version" when feature flag is enabled', async () => {
        featuresServiceSpy.isOn$.mockReturnValue(of(true));

        expect(featuresServiceSpy.isOn$).not.toHaveBeenCalled();

        const actionRef: ContentActionRef = await firstValueFrom(documentMoreMenuItemsFactoryService.getMoreMenuItems());

        expect(featuresServiceSpy.isOn$).toHaveBeenCalled();
        expect(actionRef.type).toEqual('menu');
        expect(actionRef.children?.length).toBeGreaterThan(0);

        const subActionRef = actionRef.children?.find((ref) => ref.id === 'document.create_version');

        expect(subActionRef).toBeDefined();
    });

    it('should not return an action ref of type "menu" with a child with id "document.create_version" when feature flag is not enabled', async () => {
        featuresServiceSpy.isOn$.mockReturnValue(of(false));

        expect(featuresServiceSpy.isOn$).not.toHaveBeenCalled();

        const actionRef: ContentActionRef = await firstValueFrom(documentMoreMenuItemsFactoryService.getMoreMenuItems());

        expect(featuresServiceSpy.isOn$).toHaveBeenCalled();
        expect(actionRef.type).toEqual('menu');
        expect(actionRef.children?.length).toBeGreaterThan(0);

        const subActionRef = actionRef.children?.find((ref) => ref.id === 'document.create_version');

        expect(subActionRef).not.toBeDefined();
    });
});
