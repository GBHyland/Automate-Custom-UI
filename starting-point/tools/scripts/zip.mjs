#! /usr/bin/env bun

import { Command } from 'commander';
import { createWriteStream } from 'node:fs';
import archiver from 'archiver';
import { join } from 'node:path';

async function main() {
    const program = new Command();
    program
        .name('zip')
        .description('Create a zip file')
        .option('-s, --source <output>', 'Source directory')
        .option('-t, --target <output>', 'Target archive file')
        .action(async (options) => {
            const { source, target } = options;
            if (!source || !target) {
                console.error('Source and target options are required.');
                return;
            }

            const workspaceRoot = process.cwd();
            console.info(`Creating ${target} from ${source}`);

            const sourcePath = join(workspaceRoot, source);
            const targetPath = join(workspaceRoot, target);

            await createZip(sourcePath, targetPath);
        });

    if (process.argv.length <= 2) {
        console.log(program.help());
    }

    program.parse(process.argv);
}

async function createZip(source, target) {
    return new Promise((resolve, reject) => {
        const output = createWriteStream(target);
        const archive = archiver('zip', {
            zlib: { level: 9 },
        });

        output.on('close', () => {
            console.log(archive.pointer() + ' total bytes');
            console.log('Finished zipping');
            resolve();
        });

        output.on('error', (err) => {
            reject(err);
        });

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.warn('Archiver warning: ', err);
            } else {
                reject(err);
            }
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(source, false);

        archive.finalize().catch((err) => {
            reject(err);
        });
    });
}

main().catch(console.error);
