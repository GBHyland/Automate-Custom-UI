const { getJestProjects } = require('@nx/jest');

export default {
    codeCoverage: true,
    testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
    transform: {
        '^.+\\.(ts|js|html|mjs)$': 'jest-preset-angular',
    },
    resolver: '@nx/jest/plugins/resolver',
    moduleFileExtensions: ['ts', 'js', 'html', 'mjs'],
    coverageReporters: ['html', 'lcov'],
    projects: getJestProjects(),
};
