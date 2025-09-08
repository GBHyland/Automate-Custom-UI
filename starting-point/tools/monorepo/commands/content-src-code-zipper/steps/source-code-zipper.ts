/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as Archiver from 'archiver';
import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
import { ProjectFilePathToBeExtracted } from '../project-configs/interfaces';

const archiver = require('archiver');

export class SourceCodeZipper {
    async zipCode(targetFile: string, include: string | ProjectFilePathToBeExtracted[], ignore: string[]): Promise<any> {
        const archive = this.createArchiveStream();
        const output = this.createOutputStream(targetFile);
        archive.pipe(output);

        for (const path of include) {
            if (typeof path === 'string') {
                archive.glob(path, {
                    cwd: process.cwd(),
                    ignore,
                    silent: false,
                });
            } else {
                if ('transformer' in path) {
                    let transformerResults: any;

                    if (typeof path.transformer === 'function') {
                        transformerResults = await path.transformer(path.name, path.transformerConfig);
                    } else {
                        throw new TypeError('path.transformer is not a function');
                    }

                    archive.append(transformerResults, { name: path.name });
                } else {
                    archive.glob(path.name, {
                        cwd: process.cwd(),
                        ...path.globOptions,
                    });
                }
            }
        }

        this.generateEnvironmentVariables(archive);
        await archive.finalize();
    }

    /**
     * Generates an .env file for the archived output
     * @param archive achiever instance
     */
    private generateEnvironmentVariables(archive: Archiver.Archiver) {
        const content = [`APP_CONFIG_PLUGIN_FOLDER_RULES=false`].join('\r\n');

        archive.append(content, { name: '.env' });
    }

    private createOutputStream(targetFile: string): NodeJS.WritableStream {
        const output = createWriteStream(resolve(targetFile));

        output.on('close', () => {
            console.info(resolve(targetFile));
        });

        output.on('error', (error) => {
            throw error;
        });

        return output;
    }

    private createArchiveStream(): Archiver.Archiver {
        const archive: Archiver.Archiver = archiver('zip', { zlib: { level: 9 } });

        archive.on('warning', (error) => {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        });

        archive.on('error', (error) => {
            throw error;
        });

        archive.on('finish', () => {
            console.info(`Archive has been successfully created!`);
            console.info(convertBytes(archive.pointer()));
        });

        return archive;
    }
}

function convertBytes(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) {
        return 'n/a';
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    if (i === 0) {
        return bytes + ' ' + sizes[i];
    }

    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}
