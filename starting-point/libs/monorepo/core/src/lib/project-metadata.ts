/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import type { ProjectInfoStaticResources, ProjectMetadataJson } from './monorepo.interfaces';
import { join, resolve } from 'node:path';
// cspell:disable-next-line
import structuredClone from '@ungap/structured-clone';
import { ProjectConfiguration } from '@nx/devkit';

export class ProjectMetadata {
    static DOT_ENV_FILE = '.env';

    constructor(public readonly name: string, private projectMetadata: ProjectMetadataJson, readonly workspaceProject: ProjectConfiguration) {}

    get packageJsonPath() {
        return this.projectMetadata.standalone?.projectRoot ? join(this.standaloneProjectRootPath, 'package.json') : undefined;
    }

    get standaloneProjectRootPath() {
        return this.projectMetadata.standalone?.projectRoot
            ? join(process.cwd(), this.workspaceProject.root, this.projectMetadata.standalone.projectRoot)
            : undefined;
    }

    get suffixlessReleaseVersion() {
        return this.projectMetadata.deploy?.releaseVersion;
    }

    get releaseVersion() {
        return this.projectMetadata.deploy?.releaseVersion;
    }

    get tagAliases() {
        return this.projectMetadata.deploy?.tagAliases;
    }

    get staticResources(): ProjectInfoStaticResources | undefined {
        return this.projectMetadata.staticResources;
    }

    get variables() {
        return this.projectMetadata.environment?.variables || {};
    }

    get defaultContext() {
        return this.projectMetadata.environment?.defaultContext;
    }

    get envFilePath() {
        return resolve(process.cwd(), this.workspaceProject.root, ProjectMetadata.DOT_ENV_FILE);
    }

    get metadata(): ProjectMetadataJson {
        return structuredClone(this.projectMetadata);
    }

    isStandalone(): boolean {
        return !!this.projectMetadata.standalone && !!this.projectMetadata.standalone.projectRoot;
    }

    isDeployable(): boolean {
        return !!this.projectMetadata.deploy;
    }

    updateReleaseVersion(newVersion: string, aliases: string[]): void {
        this.projectMetadata.deploy.releaseVersion = newVersion;
        this.projectMetadata.deploy.tagAliases = aliases;
    }
}
