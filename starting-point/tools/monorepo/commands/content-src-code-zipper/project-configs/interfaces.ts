/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FileTransformer } from '../transformers/file-transformer.interface';
import * as ReaddirGlob from 'readdir-glob';

export interface FilePathWithTransformer {
    name: string;
    transformer: FileTransformer;
    transformerConfig?: any;
}

export type ProjectFilePathToBeExtracted = string | FilePathWithTransformer | { name: string; globOptions: ReaddirGlob.Options };

export interface InRepoPackageConfig {
    lib: string;
    package: string;
}
