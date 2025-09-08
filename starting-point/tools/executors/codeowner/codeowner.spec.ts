import { ExecutorContext } from '@nx/devkit';

import { CodeownerExecutorSchema } from './schema';
import executor from './codeowner';

const options: CodeownerExecutorSchema = { json: true }; 
const context: ExecutorContext = {
    root: '',
    cwd: process.cwd(),
    isVerbose: false,
    projectGraph: {
        nodes: {},
        dependencies: {},
    },
    projectsConfigurations: {
        projects: {},
        version: 2,
    },
    nxJsonConfiguration: {},
};

describe('Codeowner Executor', () => {
    it('can run', async () => {
        const output = await executor(options, context);
        expect(output.success).toBe(true);
    });
});
