/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTreeHarness, MatTreeNodeHarness, TreeHarnessFilters, TreeNodeHarnessFilters } from '@angular/material/tree/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface TreeProps extends BaseHarnessProps {
    treeFilters?: TreeHarnessFilters;
}

interface TreeNodeProps extends TreeProps {
    treeNodeFilters?: TreeNodeHarnessFilters;
}

export class TreeHarnessUtils {
    private static loader: HarnessLoader;

    public static async getTree({ fixture, treeFilters, fromRoot = false }: TreeProps): Promise<MatTreeHarness> {
        TreeHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);
        const tree = await TreeHarnessUtils.loader.getHarness(MatTreeHarness.with(treeFilters));

        return tree;
    }

    public static async getTreeNodes(treeNodeProps: TreeNodeProps): Promise<MatTreeNodeHarness[]> {
        const tree = await TreeHarnessUtils.getTree(treeNodeProps);

        return tree.getNodes(treeNodeProps.treeNodeFilters);
    }
}
