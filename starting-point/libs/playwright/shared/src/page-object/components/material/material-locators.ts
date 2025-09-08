/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @alfresco/eslint-angular/no-angular-material-selectors */
export const materialLocators = {
    Accent: {
        class: '.mat-accent',
    },
    Autocomplete: {
        class: '.mat-mdc-autocomplete-panel',
    },
    Button: {
        iconButton: '.mat-mdc-icon-button',
        disabled: '.mat-mdc-button[disabled="true"]',
    },
    Card: {
        root: 'mat-card',
        class: '.mat-mdc-card',
        title: 'mat-card-title',
        actions: 'mat-card-actions',
    },
    Checkbox: {
        root: 'mat-checkbox',
        class: '.mat-mdc-checkbox',
        layout: '.mdc-checkbox',
        label: '.mdc-form-field',
    },
    Chip: {
        root: 'mat-chip',
        class: '.mat-mdc-chip',
        list: {
            root: 'mat-chip-list',
            class: '.mat-mdc-chip-list',
        },
    },
    DatePicker: {
        root: '.mat-datepicker-content',
        toggle: '.mat-datepicker-toggle',
        bodyToday: '.mat-calendar-body-today',
        bodyDay: '.mat-calendar-body-cell-content',
        selectedDay: '.mat-calendar-body-selected',
    },
    DatetimePicker: {
        root: '.mat-datetimepicker-content',
        calendar: {
            bodyActive: '.mat-datetimepicker-calendar-body-active',
            nextButton: '.mat-datetimepicker-calendar-next-button',
            previousButton: '.mat-datetimepicker-calendar-previous-button',
            headerYear: '.mat-datetimepicker-calendar-header-year',
            bodyCellContent: '.mat-datetimepicker-calendar-body-cell-content',
        },
        clock: {
            hours: '.mat-datetimepicker-clock-hours',
            minutes: '.mat-datetimepicker-clock-minutes',
            cell: '.mat-datetimepicker-clock-cell',
            cellSelected: '.mat-datetimepicker-clock-cell-selected',
        },
        month: '.mat-month-content',
        toggle: 'mat-datetimepicker-toggle',
    },
    Dialog: {
        container: {
            root: 'mat-dialog-container',
        },
        content: {
            root: 'mat-dialog-content',
            class: '.mat-mdc-dialog-content',
        },
        actions: `mat-dialog-actions`,
        title: '.mat-mdc-dialog-title',
    },
    Error: {
        class: '.mat-mdc-form-field-error',
    },
    Expanded: {
        class: '.mat-expanded',
    },
    Expansion: {
        panel: {
            root: 'mat-expansion-panel',
            header: '.mat-expansion-panel-header',
            title: '.mat-expansion-panel-header-title',
        },
        indicator: '.mat-expansion-indicator',
    },
    Form: {
        field: '.mat-mdc-form-field',
        fieldInfix: '.mat-mdc-form-field-infix',
        fieldFlex: '.mat-mdc-form-field-flex',
    },
    Icon: {
        root: 'mat-icon',
        class: '.mat-icon',
    },
    Input: {
        class: '.mat-mdc-input-element',
    },
    List: {
        class: '.mat-mdc-list',
        item: {
            root: 'mat-list-item',
            class: '.mat-mdc-list-item',
            line: '.mat-mdc-list-item-line',
        },
        option: 'mat-list-option',
        selectionList: 'mat-selection-list',
    },
    Menu: {
        class: '.mat-mdc-menu-content',
        text: '.mat-mdc-menu-item-text',
    },
    Option: {
        root: 'mat-option',
        class: '.mat-mdc-option',
        group: 'mat-optgroup',
        text: '.mdc-list-item__primary-text',
    },
    Paginator: {
        class: '.mat-mdc-paginator',
        navigation: (rangeAction: string) => `.mat-mdc-paginator-navigation-${rangeAction}`,
        dropdownTrigger: '.mat-mdc-paginator-touch-target',
    },
    Panel: {
        title: 'mat-panel-title',
    },
    ProgressSpinner: {
        root: 'mat-progress-spinner',
        class: '.mat-mdc-progress-spinner',
    },
    Radio: {
        button: 'mat-radio-button',
        group: 'mat-radio-group',
        checked: 'mat-mdc-radio-checked',
    },
    RippleElement: {
        class: '.mat-ripple-element',
    },
    Select: {
        root: 'mat-select',
        class: '.mat-mdc-select',
        arrow: {
            class: '.mat-mdc-select-arrow',
            wrapper: '.mat-mdc-select-arrow-wrapper',
        },
        panel: {
            class: '.mat-mdc-select-panel',
            wrap: '.cdk-overlay-panel',
        },
        value: {
            class: '.mat-mdc-select-value',
            text: '.mat-mdc-select-value-text',
        },
        minLine: '.mat-mdc-select-min-line',
    },
    Sidenav: {
        root: 'mat-sidenav',
    },
    Slide: {
        toggle: '.mat-mdc-slide-toggle',
    },
    Spinner: {
        root: 'mat-spinner',
    },
    Step: {
        header: 'mat-step-header',
        content: {
            horizontal: {
                class: '.mat-horizontal-stepper-content',
                inactive: '[inert]',
            },
        },
        text: {
            label: '.mat-step-text-label',
        },
    },
    Tab: {
        id: 'mat-tab',
        header: '.mat-mdc-tab-header',
        label: '.mdc-tab__text-label',
        list: '.mat-mdc-tab-list',
    },
    Table: {
        class: '.mat-mdc-table',
        row: {
            root: 'mat-mdc-row',
            class: '.mat-mdc-row',
        },
        cell: '.mat-mdc-cell',
        column: (matColumn: string) => `.mat-column-${matColumn}`,
    },
    Toolbar: {
        root: 'mat-toolbar',
        class: '.mat-toolbar',
    },
    Tooltip: {
        root: 'mat-tooltip-component',
        trigger: '.mat-mdc-tooltip-trigger',
    },
};
