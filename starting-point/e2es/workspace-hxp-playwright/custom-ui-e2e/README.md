# e2e tests for workspace-hxp source code

This suite tests the application created from the extracted source code.

The source code is modified before testing using `@hyland/extend` generators.

For more information about plugins please check [this](https://hyland.atlassian.net/wiki/spaces/HXP/pages/2830042158/3.+Workspace+Extensions#Plugin-structure) page.

## test execution

Tests related to custom-ui are executed as part of the Pack content artifacts → Test build, which is based on the content-ee-apa source code.

There is no need to include these tests in the project.json file under the E2E section, as they are executed differently and cannot run at the PR level. As a result, their configuration differs slightly.
