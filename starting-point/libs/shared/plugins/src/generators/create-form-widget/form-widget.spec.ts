/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Tree } from '@nx/devkit';
import { MOCK_PLUGIN_FOLDER, MOCK_PLUGIN_NAME, MOCK_PLUGIN_OPTIONS, generateMockPlugin } from '../shared/testing/generate-mock-plugin';
import formWidgetGenerator from './form-widget';
import { CreateFormWidgetSchema } from './schema';

describe('Create form widget generator', () => {
    let originalAppTree: Tree;
    let appTree: Tree;

    const formWidgetName = 'my-test-form-widget';
    const formWidgetSrcFolder = `${MOCK_PLUGIN_FOLDER}/${MOCK_PLUGIN_NAME}/src/lib/form-widgets/${formWidgetName}`;
    const formWidgetOptions: CreateFormWidgetSchema = {
        pluginName: `${MOCK_PLUGIN_NAME}`,
        formWidgetName,
    };

    beforeEach(async () => {
        appTree = await generateMockPlugin(originalAppTree, MOCK_PLUGIN_OPTIONS);
    });

    describe('When no previous form widgets have been generated', () => {
        it('should create a "form-widgets" folder and generate the new widget inside it', async () => {
            await formWidgetGenerator(appTree, formWidgetOptions);

            expect(appTree.exists(`${MOCK_PLUGIN_FOLDER}/${MOCK_PLUGIN_NAME}/src/lib/form-widgets`)).toBeTruthy();
            expect(appTree.exists(`${formWidgetSrcFolder}/${formWidgetName}.component.ts`)).toBeTruthy();
            expect(appTree.exists(`${formWidgetSrcFolder}/${formWidgetName}.module.ts`)).toBeTruthy();
        });
    });

    describe('When previous form widgets have been generated in the same plugin', () => {
        beforeEach(async () => {
            await formWidgetGenerator(appTree, formWidgetOptions);
        });

        it('should generate the new widget inside the existing "form-widgets" folder if the name is unique', async () => {
            const anotherFormWidgetName = 'another-test-form-widget';
            const anotherFormWidgetSrcFolder = `${MOCK_PLUGIN_FOLDER}/${MOCK_PLUGIN_NAME}/src/lib/form-widgets/${anotherFormWidgetName}`;
            const anotherFormWidgetOptions: CreateFormWidgetSchema = {
                pluginName: formWidgetOptions.pluginName,
                formWidgetName: anotherFormWidgetName,
            };

            await formWidgetGenerator(appTree, anotherFormWidgetOptions);

            expect(appTree.exists(`${anotherFormWidgetSrcFolder}/${anotherFormWidgetName}.component.ts`)).toBeTruthy();
            expect(appTree.exists(`${anotherFormWidgetSrcFolder}/${anotherFormWidgetName}.module.ts`)).toBeTruthy();
        });

        it('should not generate the new form-widget if the name is not unique', async () => {
            try {
                await formWidgetGenerator(appTree, formWidgetOptions);
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error).toEqual(new Error(`Form widget with name ${formWidgetName} already exists`));
            }
        });
    });
});
