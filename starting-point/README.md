# About this repository

## Introduction

The repository is a "monorepo", hosting multiple applications and libraries, based on
[Alfresco Application Development Framework (ADF)](https://github.com/Alfresco/alfresco-ng2-components) components.

## Installing dependencies

Run the following command to install all third-party dependencies:

```bash
npm ci
```

To easily manage Node.js version please refer to [Node Version Manager](./developer-docs/nvm.md).

## Setting up environment variables

Each application requires various environment variables to be set. To see which variables follow the [.env File Generator Tool](./developer-docs/local-development/env-setup.md). 

## Running an application 

Use one of the following commands to run the application:

```bash
# Development server
npm start <app-name>

# Production server
npm start <app-name> -- --prod
```

*where `app-name` refers the project's name found in the workspace configuration (angular.json or the related project.jsons).*

## Building an application

Use one of the following commands to build the application:

```bash
# develop build
npm run build <app-name>

# Production build
npm run build <app-name> -- --prod
```

*where `app-name` refers the project's name found in the workspace configuration (angular.json or the related project.jsons).*

For large projects, you may want to update your local `.env` file with:

```dotenv
NODE_OPTIONS=--max_old_space_size=8192
```

## Running unit tests

Use the following command to run the unit tests:

```bash
# Test runner command in CI
npm test <project name>
```

*where `project-name` refers the project's name found in the workspace configuration (angular.json or the related project.jsons).*

Please - when passing other unit test runner options - be aware that some of the applications might be using [karma](http://karma-runner.github.io/4.0/config/configuration-file.html), while other applications and its libraries might be using [jest](https://jestjs.io/docs/en/23.x/cli).
*To understand which project uses what, please check the workspace configuration (angular.json or the related project.jsons).*

## Generating code coverage
Karma can generate code coverage with Istanbul plugin. 
The coverage folder will be created in the root folder by running:

```bash
# Generate code coverage for a specific project
nx test <project name> --codeCoverage

# Generate code coverage for everything
nx run-many -t test --code-coverage
```

## Generating a new Angular component

To generate a new Angular component in a specific library or app, use the Nx CLI:

```bash
cd <project-path>
npx nx g @nx/angular:component <component-path>
```

## Further app specific README-s

For further information please see the README file of every app in their root directory.

## See Also

Check also the [README](./developer-docs/README.md) in developer docs
