/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FileTransformer } from './file-transformer.interface';
import * as fs from 'node:fs';

export interface TransformStringInFileConfig {
    from: string;
    to: string;
}

export const transformStringInFile: FileTransformer<TransformStringInFileConfig> = (filePath: string, config: TransformStringInFileConfig) => {
    const appConfigBuffer = fs.readFileSync(filePath);
    const appConfig = appConfigBuffer.toString();
    return appConfig.replace(config.from, config.to);
};
