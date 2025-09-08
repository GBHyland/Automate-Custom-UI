/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MonorepoController } from './monorepo.controller';
import { ProjectInfoStaticResources } from './monorepo.interfaces';
import { ProjectMetadata } from './project-metadata';
import { ProjectMetadataIO } from './project-metadata-io';
import { WorkspaceConfig } from './workspace-config';
import * as fs from 'node:fs';
import { join } from 'node:path';

describe('Monorepo Controller', () => {
    let workspaceDefinition: any;
    let staticResources: ProjectInfoStaticResources;

    beforeEach(() => {
        staticResources = {
            dockerFile: 'dockerFile',
            repositories: [
                {
                    repositoryDomain: 'domain.io',
                    repositorySlug: 'company',
                },
            ],
        };

        workspaceDefinition = {
            projects: {
                pikachu: {
                    root: 'path/to/project',
                    sourceRoot: 'path/to/project/src',
                },
                tutum: {
                    root: 'path/to/project2',
                    sourceRoot: 'path/to/project2/src',
                },
                staticResources: {
                    root: 'path/to/project3',
                    sourceRoot: 'path/to/project3/src',
                },
            },
        };

        jest.spyOn(WorkspaceConfig.prototype, 'getProjectNames').mockReturnValue(Promise.resolve(Object.keys(workspaceDefinition.projects)));
        jest.spyOn(WorkspaceConfig.prototype, 'getProject').mockImplementation((projectName) => workspaceDefinition.projects[projectName]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getMonorepoProjectMetadata', () => {
        it(`should return static resources`, async () => {
            const projectMetadata = new ProjectMetadata(
                'name',
                {
                    staticResources,
                },
                {
                    root: '.',
                }
            );

            jest.spyOn(ProjectMetadataIO, 'load').mockReturnValue(Promise.resolve(projectMetadata));

            const projectInfo = await MonorepoController.getMonorepoProjectAsync('staticResources');
            expect(projectInfo.staticResources).toEqual(staticResources);
        });

        it(`should throw error if non existing project is tried to be retrieved`, async () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);

            try {
                await MonorepoController.getMonorepoProjectAsync('piccolo');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe(`Project (piccolo) doesn't exist in workspace file`);
            }
        });

        it(`should throw error if project's monorepo info doesn't exist`, async () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);
            const filePath = join(process.cwd(), 'path', 'to', 'project2', 'project.info.json');

            try {
                await MonorepoController.getMonorepoProjectAsync('tutum');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe(`Project's metadata shard, can't be found: ${filePath}`);
            }
        });
    });
});
