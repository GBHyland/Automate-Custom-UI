/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as fs from 'node:fs';
import { logger } from './node-logger';
import { paths } from '.';
import path from 'node:path';

export const UtilFile = {
    async readFile(filePath: string): Promise<string> {
        await this.isFile(filePath);
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    },

    async isFile(fileToUse: string) {
        return fs.promises
            .access(fileToUse, fs.constants.F_OK)
            .then(() => true)
            .catch(() => false);
    },

    async readJsonFile(filePath: string): Promise<any> {
        const data = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(data);
    },

    writeJsonFile(json: any, pathToFile: string): void {
        fs.writeFile(pathToFile, JSON.stringify(json, null, 2), (err) => {
            if (err) {
                logger.error('Error writing JSON file:', err);
            }
        });
    },

    async getStreamFromFile(filePath: string): Promise<fs.ReadStream> {
        await this.isFile(filePath);
        return fs.createReadStream(filePath);
    },

    getFileFromString(fileName: string, fileContent: string): fs.ReadStream {
        const filePath = `${paths.files}/${fileName}`;
        if (!fs.existsSync(paths.files)) {
            fs.mkdirSync(paths.files, { recursive: true });
        }

        fs.writeFileSync(filePath, fileContent);
        return fs.createReadStream(filePath);
    },

    getFileFromFileSystem(filePath: string): fs.ReadStream {
        return fs.createReadStream(filePath);
    },

    async getFilePaths(basePath: string, folderPath: string): Promise<string[]> {
        const resolvedFolderPath = path.resolve(basePath, folderPath);
        const allFiles = await fs.promises.readdir(resolvedFolderPath);
        return allFiles.map((file) => path.join(resolvedFolderPath, file));
    },

    async getFilePath(basePath: string, filePath: string): Promise<string> {
        return path.resolve(basePath, filePath);
    },

    async getFileCount(basePath: string, folderPath: string): Promise<number> {
        const filePaths = await this.getFilePaths(basePath, folderPath);
        return filePaths.length;
    },
};
