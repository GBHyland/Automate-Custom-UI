/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExecutorContext, runExecutor } from '@nx/devkit';
import customExecutor from './executor';

jest.mock('@nx/devkit', () => ({
    runExecutor: jest.fn(() => Promise.resolve([{ success: true }])),
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

describe('customExecutor', () => {
    let context: ExecutorContext;
    let options: unknown;

    beforeEach(() => {
        context = {
            root: '',
            projectName: 'my-app',
            workspace: {},
        } as unknown as ExecutorContext;
        options = {};
    });

    it('should call runExecutor with the correct parameters', async () => {
        await customExecutor(options, context);

        expect(runExecutor).toHaveBeenCalledWith({ project: 'my-app', target: 'build-esbuild' }, options, context);
    });
});
