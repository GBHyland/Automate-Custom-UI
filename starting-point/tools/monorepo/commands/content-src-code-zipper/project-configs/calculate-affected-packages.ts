/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProjectGraph } from '@nx/devkit';
import { execSync } from 'node:child_process';
import { readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

export function calculateAffectedPackages(project: string): string[] {
    execSync(`npx nx graph --file=tmp/tools/graph.json --focus ${project}`);
    const nxGeneratedGraph = readFileSync('tmp/tools/graph.json').toString();

    let parsedGraph: { graph?: ProjectGraph };
    try {
        parsedGraph = JSON.parse(nxGeneratedGraph) as { graph?: ProjectGraph };
    } catch {
        console.error('Error parsing NX generated graph:\n', nxGeneratedGraph);
        return [];
    } finally {
        unlinkSync('tmp/tools/graph.json');
    }

    const dependencyNodes = Object.values(parsedGraph?.graph.nodes);

    return Array.isArray(dependencyNodes)
        ? (dependencyNodes.map((node) => join(node?.data?.root, '**')).filter((path) => path !== undefined) as string[])
        : [];
}
