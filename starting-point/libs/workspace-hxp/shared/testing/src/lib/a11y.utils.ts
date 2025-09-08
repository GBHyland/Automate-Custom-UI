/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AxeResults, ElementContext, RunOnly } from 'axe-core';

export const defaultConfiguration = {
    runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
    } as RunOnly,
};

export interface A11yAnalysisResult {
    results: AxeResults;
    incomplete: { [violationId: string]: number }[];
    violations: { [violationId: string]: number }[];
}

export const a11yReport = async (element: ElementContext, testConfiguration = defaultConfiguration): Promise<A11yAnalysisResult | undefined> => {
    const axeCore = await import('axe-core');
    return axeCore
        .run(element, testConfiguration)
        .then((results): A11yAnalysisResult => {
            const report: A11yAnalysisResult = {
                results,
                incomplete: results.incomplete.map((result) => {
                    return {
                        [result.id]: result.nodes.length,
                    };
                }),
                violations: results.violations.map((result) => {
                    return {
                        [result.id]: result.nodes.length,
                    };
                }),
            };
            return report;
        })
        .catch((err: any) => {
            throw err;
        });
};
