# Workspace-hxp process-services-cloud-extension tests organisation

The folders names might be a little confusing, so here's explanation of what's expected to be found in our structure

## form-widgets-e2e

Form widgets like `dropdown`, `data table` or `attach file`. These tests should focus on the widget, instead of where it is in the process.
Checking interactions of widgets in the same form is ok, but if it involves mapping on process level, then it should be in `process-automation-e2e`.

## forms-e2e

Forms, but not focusing on the widgets themselves, meaning modules like form outcomes, form rules, visibility conditions.

## process-automation-e2e

Processes and their flow. Most of tests belonging to this category should be in our BE tests, but there are some corner cases, where sending a request and checking response or audit doesn't show the full picture.

## processes-e2e

Lists of processes, sorting, filtering, starting processes from different places across application, different UI configuration.

## tasks-e2e

Lists of tasks, sorting, filtering, changing assigness.
