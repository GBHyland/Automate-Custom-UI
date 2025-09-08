/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export default {
    preset: '../../../../jest.preset.js',
    testRunner: 'jasmine2',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.adf.json',
                isolatedModules: true,
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@alfresco\\/js-api|diagram-js|bpmn-js|@ngrx)'],
    snapshotSerializers: [
        'jest-preset-angular/build/serializers/no-ng-attributes',
        'jest-preset-angular/build/serializers/ng-snapshot',
        'jest-preset-angular/build/serializers/html-comment',
    ],
    moduleNameMapper: {
        '^@hylandsoftware/hxcs-js-client': process.cwd() + '/node_modules/@hylandsoftware/hxcs-js-client/umd/index.umd.min.js',
        '^axios$': 'axios/dist/node/axios.cjs',
    },
};
