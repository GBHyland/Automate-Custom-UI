/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MoveDistExecutorSchema } from './schema';
import executor from './executor';
import { ExecutorContext, ProjectGraph } from '@nx/devkit';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

jest.mock('node:fs');
jest.mock('node:child_process');

const options: MoveDistExecutorSchema = {
    source: 'libs/adf/enterprise/adf-hx-content-services/api/dist',
    destination: 'dist/libs/adf/enterprise/adf-hx-content-services/api/moved',
};

const context: ExecutorContext = {
    root: '/root',
    projectName: 'test-project',
    targetName: 'build',
    configurationName: 'production',
    cwd: '/root',
    isVerbose: false,
    projectsConfigurations: {
        version: 2,
        projects: {
            'test-project': {
                root: 'libs/adf/enterprise/adf-hx-content-services/api',
                sourceRoot: 'libs/adf/enterprise/adf-hx-content-services/api/src',
                projectType: 'library',
                targets: {},
            },
        },
    },
    nxJsonConfiguration: {},
    projectGraph: {} as ProjectGraph,
};

describe('MoveDist Executor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should copy files from source to destination', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        const mkdirSyncMock = (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
        const rmSyncMock = (fs.rmSync as jest.Mock).mockImplementation(() => {});
        const execSyncMock = (execSync as jest.Mock).mockImplementation(() => {});

        const output = await executor(options, context);
        expect(output.success).toBe(true);
        expect(fs.existsSync).toHaveBeenCalledWith(path.join(context.root, options.source));
        expect(fs.existsSync).toHaveBeenCalledWith(path.join(context.root, options.destination));
        expect(rmSyncMock).toHaveBeenCalledWith(path.join(context.root, options.destination), { recursive: true, force: true });
        expect(mkdirSyncMock).toHaveBeenCalledWith(path.join(context.root, options.destination), { recursive: true });
        expect(execSyncMock).toHaveBeenCalledWith(
            `cp -r ${path.join(context.root, options.source)}/* ${path.join(context.root, options.destination)}`,
            { stdio: 'inherit' }
        );
    });

    it('should fail if source path does not exist', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        const output = await executor(options, context);
        expect(output.success).toBe(false);
        expect(fs.existsSync).toHaveBeenCalledWith(path.join(context.root, options.source));
    });

    it('should handle errors during file operations', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.rmSync as jest.Mock).mockImplementation(() => {
            throw new Error('rmSync error');
        });

        const output = await executor(options, context);
        expect(output.success).toBe(false);
    });
});
