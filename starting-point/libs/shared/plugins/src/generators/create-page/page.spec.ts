/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Tree } from '@nx/devkit';
import { pageGenerator } from './page';
import { generateMockPlugin, MOCK_PLUGIN_FOLDER, MOCK_PLUGIN_NAME, MOCK_PLUGIN_OPTIONS } from '../shared/testing/generate-mock-plugin';
import { CreatePageSchema } from './schema';
import { createTreeWithEmptyWorkspace } from 'nx/src/devkit-testing-exports';

describe('page generator', () => {
    let originalAppTree: Tree;
    let appTree: Tree = createTreeWithEmptyWorkspace();

    const pageName = 'my-test-page';
    const pageMenuItemSuffix = 'menu-item';
    const pageSrcFolder = `${MOCK_PLUGIN_FOLDER}/${MOCK_PLUGIN_NAME}/src/lib/pages/${pageName}`;
    const pageOptions: CreatePageSchema = {
        pluginName: `${MOCK_PLUGIN_NAME}`,
        pageName,
        directory: 'pages',
    };

    beforeEach(async () => {
        appTree = await generateMockPlugin(originalAppTree, MOCK_PLUGIN_OPTIONS);
    });

    describe('When no previous pages have been generated', () => {
        it('should create a "pages" folder and generate the new page inside it', async () => {
            await pageGenerator(appTree, pageOptions);

            expect(appTree.exists(`${MOCK_PLUGIN_FOLDER}/${MOCK_PLUGIN_NAME}/src/lib/pages`)).toBeTruthy();
            expect(appTree.exists(`${MOCK_PLUGIN_FOLDER}/${MOCK_PLUGIN_NAME}/configs/${MOCK_PLUGIN_NAME}.extension.config.json`)).toBeTruthy();
            expect(appTree.exists(`${pageSrcFolder}/${pageName}-${pageMenuItemSuffix}.component.ts`)).toBeTruthy();
            expect(appTree.exists(`${pageSrcFolder}/${pageName}.component.ts`)).toBeTruthy();
            expect(appTree.exists(`${pageSrcFolder}/${pageName}.module.ts`)).toBeTruthy();
        });
    });

    describe('When previous pages have been generated in the same plugin', () => {
        beforeEach(async () => {
            await pageGenerator(appTree, pageOptions);
        });

        it('should generate the new page inside the existing "pages" folder if the name is unique', async () => {
            const anotherPageName = 'another-test-page';
            const anotherPageSrcFolder = `${MOCK_PLUGIN_FOLDER}/${MOCK_PLUGIN_NAME}/src/lib/pages/${anotherPageName}`;
            const anotherPageOptions: CreatePageSchema = {
                pluginName: pageOptions.pluginName,
                pageName: anotherPageName,
                directory: 'pages',
            };

            await pageGenerator(appTree, anotherPageOptions);

            expect(appTree.exists(`${anotherPageSrcFolder}/${anotherPageName}-${pageMenuItemSuffix}.component.ts`)).toBeTruthy();
            expect(appTree.exists(`${anotherPageSrcFolder}/${anotherPageName}.component.ts`)).toBeTruthy();
            expect(appTree.exists(`${anotherPageSrcFolder}/${anotherPageName}.module.ts`)).toBeTruthy();
        });

        it('should not generate the new page if the name is not unique', async () => {
            try {
                await pageGenerator(appTree, pageOptions);
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error).toEqual(new Error(`Page with name ${pageName} already exists`));
            }
        });
    });
});
