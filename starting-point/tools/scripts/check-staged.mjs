#! /usr/bin/env node

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { styleText } from 'node:util';
import { exit } from 'node:process';

const forbiddenPattern = /\[@\.disabled\]\s*=\s*"true"/g;

function getStagedHtmlFiles() {
    const output = execSync('git diff --cached --name-only --diff-filter=d', {
        encoding: 'utf8',
    });
    return output.split('\n').filter((file) => file.endsWith('.html') && existsSync(file));
}

function checkForForbiddenPattern(files) {
    for (const file of files) {
        const content = readFileSync(file, 'utf8');
        if (forbiddenPattern.test(content)) {
            console.error(styleText('red', `❌ Forbidden pattern found in: ${file}.`));
            console.error(
                styleText(
                    'red',
                    '❌ Using the @.disabled host binding, animations are turned off on all inner elements as well. This might result in animations missing unexpectedly from child components. Please remove this pattern before committing.'
                )
            );
            exit(1);
        }
    }
    exit(0);
}

function main() {
    const stagedHtmlFiles = getStagedHtmlFiles();
    if (stagedHtmlFiles.length === 0) {
        exit(0);
    }

    checkForForbiddenPattern(stagedHtmlFiles);
}

main();
