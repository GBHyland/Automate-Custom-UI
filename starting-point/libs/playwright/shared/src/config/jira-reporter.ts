/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { paths } from '../utils';

interface TestSkippedData {
    testTitle: string;
    skipDescription: string;
}

class ReporterForJiraTicketCreation implements Reporter {
    private testFailed = [];
    private testSkipped: TestSkippedData[] = [];

    onTestEnd(test: TestCase, result: TestResult) {
        if (Number(result.retry) === Number(process.env.PLAYWRIGHT_RETRY) && result.status !== 'passed') {
            this.testFailed.push({
                suiteTitle: test.parent.title,
                testTitle: test.title,
                projectName: test.parent.project()?.name ?? 'Unknown Project',
                error: result.error,
            });
        }
        if (result.status === 'skipped') {
            this.testSkipped.push({
                testTitle: test.title,
                skipDescription: test.annotations[0].description,
            });
        }
    }

    onEnd() {
        if (this.testFailed.length > 0) {
            const parsed = JSON.stringify(this.testFailed);
            fs.writeFileSync(join(process.cwd(), `${paths.allData}/testResults.json`), parsed, 'utf8');
        }

        if (this.testSkipped.length > 0) {
            console.warn('\n\nSkipped tests:');
            for (const test of this.testSkipped) {
                console.warn(`\n - ${test.testTitle} : ${test.skipDescription}`);
            }
        }
    }
}

export default ReporterForJiraTicketCreation;
