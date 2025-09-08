/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as envsub from 'envsub';
import { resolve } from 'node:path';
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
const dotenv = require('dotenv');

interface SimpleEnvSetting {
    name: string;
    value: string;
}

interface FileContentEnvSetting {
    name: string;
    value: {
        type: 'file';
        path: string;
    };
}

export type EnvSetting = SimpleEnvSetting | FileContentEnvSetting;

interface AppConfigEnvsubOptions {
    application: string;
    projectName?: string;
    externalScript?: string;
    distPath: string;
    envs?: EnvSetting[];
}

export async function substituteAppConfig(options: AppConfigEnvsubOptions): Promise<void> {
    dotenv.config({ path: resolve(process.cwd(), 'apps', options.application, '.env') });

    if (options.externalScript) {
        const customFunction = await import(`${options.externalScript}`);
        await customFunction(options?.projectName);
    }

    if (options.envs?.length > 0) {
        for (const env of options.envs) {
            process.env[env.name] = typeof env.value === 'object' ? readFileSync(env.value.path, 'utf8') : env.value;
        }
    }

    const filePath = resolve(process.cwd(), options.distPath, 'app.config.json');
    console.log(`Substituting ${filePath} with environment vars set for ${options.application}.`);

    const envsubOpts = {
        templateFile: filePath,
        outputFile: filePath,
        // Apparently this doesn't work with envsub, hence above we have added the envs to the process.env
        envs: options.envs ?? {},
        syntax: 'dollar-curly',
        options: {
            all: true,
            system: true,
        },
    };

    const { outputContents } = await envsub(envsubOpts);
    checkIfVariablesAreStillPresent(outputContents);
    checkIfSchemaIsValid(outputContents);
    displayAppConfig(outputContents);
    console.log('App config substitution succeeded.');
}

function checkIfVariablesAreStillPresent(output: string) {
    const variableNameMatches = [...output.matchAll(/\$\{[A-Z0-9_]*\}/g)];
    if (variableNameMatches.length > 0) {
        const message = variableNameMatches.reduce((acc, match) => {
            return `${acc}\n${match[0]}`;
        }, 'Variables still present in the app.config.json file:');

        throw new Error(message);
    }
}

function checkIfSchemaIsValid(output: string) {
    const ajv = new Ajv({
        allErrors: true,
    });
    const schema = JSON.parse(readFileSync(resolve(process.cwd(), 'node_modules/@alfresco/adf-core/app.config.schema.json'), 'utf8'));
    const validate = ajv.compile(schema);
    const valid = validate(JSON.parse(output));
    if (!valid) {
        const message = validate.errors?.reduce((acc, error) => {
            return `${acc}\n${error.schemaPath}: ${error.message}`;
        }, 'Invalid app.config.json file:\n');

        throw new Error(message);
    }
}

function displayAppConfig(result: string) {
    console.log('::group::App config envsub');
    console.log(result);
    console.log('::endgroup::');
}
