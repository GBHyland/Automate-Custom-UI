// javascript
const cp = require('child_process');

// Use npm.cmd on Windows, otherwise use npm
const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('Using npm executable: ', npmExecutable);

const getVersion = cp.spawn(npmExecutable, ['ls', '@infragistics/igniteui-angular', '--json'], { shell: false });

let output = '';

getVersion.stdout.on('data', (data) => {
    output += data;
});

getVersion.stderr.on('data', (data) => {
    console.error('stderr:', data.toString());
});

getVersion.on('error', (err) => {
    console.error('Failed to start subprocess. Make sure npm is installed and in your PATH:', err.message);
});

getVersion.on('close', (code) => {
    if (code !== 0) {
        console.error(`npm ls process exited with code ${code}`);
        return;
    }
    try {
        const parsed = JSON.parse(output);
        if (!parsed.dependencies?.['@infragistics/igniteui-angular']) {
            throw new Error('Dependency "@infragistics/igniteui-angular" not found.');
        }
        const version = parsed.dependencies['@infragistics/igniteui-angular'].version;
        const mode = process.argv[2];
        const installArgs =
            mode === 'ci'
                ? ['install', `@infragistics/igniteui-angular@${version}`, '--save-exact']
                : ['install', `igniteui-angular@${version}`, '--save-exact'];

        console.log('Running npm install with args:', installArgs.join(' '));

        const install = cp.spawn(npmExecutable, installArgs, { shell: false });

        install.stdout.on('data', (data) => {
            console.log('stdout:', data.toString());
        });

        install.stderr.on('data', (data) => {
            console.error('stderr:', data.toString());
        });

        install.on('error', (err) => {
            console.error('Failed to start install process:', err.message);
        });

        install.on('close', (code) => {
            if (code !== 0) {
                console.error(`npm install process exited with code ${code}`);
            } else {
                console.log('npm install completed successfully.');
            }
        });
    } catch (err) {
        console.error('Error parsing output or running install:', err.message);
    }
});
