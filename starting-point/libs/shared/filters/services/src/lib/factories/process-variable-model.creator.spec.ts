/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ProcessVariableModelCreator } from './process-variable-model.creator';
import { DateCloudFilterType, DateRangeFilterService } from '@alfresco/adf-process-services-cloud';
import { VariableDateModelCreator } from './variable-model-creators/date-model.creator';
import {
    DATE_OPTIONS,
    DateFilterValue,
    NumberFilterOperatorType,
    NumberFilterValue,
    ProcessVariableDateFilter,
    ProcessVariableNumberFilter,
    ProcessVariableRadioFilter,
    ProcessVariableStringFilter,
} from '../filter';
import * as mappers from './mappers';
import { ProcessVariableFilterModelExtension } from './interfaces';

jest.mock('./mappers', () => {
    const originalModule = jest.requireActual('./mappers');

    return {
        ...originalModule,
        mapDateToLocalTimeZone: (date: string) => {
            return date;
        },
    };
});

const createProcessNumberFilter = (name: string, variableType: 'bigdecimal' | 'integer', value: NumberFilterValue): ProcessVariableNumberFilter => {
    return new ProcessVariableNumberFilter({
        data: {
            variableType,
            operator: mappers.mapNumberOperatorsToProcessFilterOperator(value.operator),
            processDefinitionKey: `${name}ProcessDefinitionKey`,
            variableName: name,
        },
        name: name,
        value,
        translationKey: `${name}TranslationKey`,
        visible: true,
    });
};

const createProcessDateFilter = (name: string, variableType: 'date' | 'datetime', value: DateFilterValue | null): ProcessVariableDateFilter => {
    return new ProcessVariableDateFilter({
        data: {
            variableType,
            operator: value.selectedOption?.value ?? '',
            processDefinitionKey: `${name}ProcessDefinitionKey`,
            variableName: name,
        },
        name: 'date',
        value,
        options: [],
        translationKey: `${name}TranslationKey`,
        visible: true,
    });
};

describe('ProcessVariableModelCreator', () => {
    const TODAY = '2020-01-20';
    let processVariableModelCreatorService: ProcessVariableModelCreator;

    let bigdecimalEqualsFilter: ProcessVariableNumberFilter;
    let bigdecimalEmptyFilter: ProcessVariableNumberFilter;

    let dateTodayFilter: ProcessVariableDateFilter;
    let dateEmptyFilter: ProcessVariableDateFilter;

    let dateRangeFilterService: DateRangeFilterService;

    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date(TODAY));
    });

    beforeEach(() => {
        bigdecimalEqualsFilter = createProcessNumberFilter('bigdecimalEqualsFilter', 'bigdecimal', {
            operator: NumberFilterOperatorType.EQUALS,
            value1: 1,
            value2: null,
        });

        bigdecimalEmptyFilter = createProcessNumberFilter('bigdecimalEmptyFilter', 'bigdecimal', {
            operator: NumberFilterOperatorType.EQUALS,
            value1: null,
            value2: null,
        });

        dateTodayFilter = createProcessDateFilter('dateTodayFilter', 'date', {
            selectedOption: { label: 'label', value: DateCloudFilterType.TODAY },
            range: null,
        });

        dateEmptyFilter = createProcessDateFilter('dateEmptyFilter', 'date', {
            selectedOption: null,
            range: null,
        });

        TestBed.configureTestingModule({
            providers: [ProcessVariableModelCreator, DateRangeFilterService, VariableDateModelCreator],
        });

        processVariableModelCreatorService = TestBed.inject(ProcessVariableModelCreator);
        dateRangeFilterService = TestBed.inject(DateRangeFilterService);
        jest.spyOn(dateRangeFilterService, 'getDateRange').mockImplementation((type) => {
            if (type) {
                return {
                    startDate: '2020-01-20',
                    endDate: '2020-01-26',
                };
            }
            return {
                startDate: null,
                endDate: null,
            };
        });
    });

    it('should return "date" model only when filter value is set', () => {
        const dateFilters: ProcessVariableDateFilter[] = [dateTodayFilter, dateEmptyFilter];

        const models = processVariableModelCreatorService.createProcessVariableFilters(dateFilters);

        expect(models.length).toBe(1);
        expect(models[0]).toEqual({
            processDefinitionKey: dateTodayFilter.data.processDefinitionKey,
            name: dateTodayFilter.data.variableName,
            type: 'date',
            value: TODAY,
            operator: 'eq',
            data: DateCloudFilterType.TODAY,
        });
    });

    it('should return "bigdecimal" model only when filter value is set', () => {
        const dateFilters: ProcessVariableNumberFilter[] = [bigdecimalEqualsFilter, bigdecimalEmptyFilter];

        const models = processVariableModelCreatorService.createProcessVariableFilters(dateFilters);

        expect(models.length).toBe(1);
        expect(models[0]).toEqual({
            processDefinitionKey: bigdecimalEqualsFilter.data.processDefinitionKey,
            name: bigdecimalEqualsFilter.data.variableName,
            type: 'bigdecimal',
            value: bigdecimalEqualsFilter.value.value1,
            operator: 'eq',
            data: NumberFilterOperatorType.EQUALS,
        });
    });

    it('should create filter model for string type', () => {
        const processStringFilter = new ProcessVariableStringFilter({
            data: {
                processDefinitionKey: 'processDefinitionKey',
                variableName: 'variableName',
                variableType: 'string',
                operator: 'eq',
            },
            name: 'name',
            translationKey: 'name',
            value: ['value'],
            visible: true,
        });

        const expectedModel: ProcessVariableFilterModelExtension = {
            name: processStringFilter.data.variableName,
            processDefinitionKey: processStringFilter.data.processDefinitionKey,
            type: processStringFilter.data.variableType,
            operator: 'like',
            value: 'value',
        };

        const model = processVariableModelCreatorService.createProcessVariableFilters([processStringFilter]);
        expect(model).toEqual([expectedModel]);
    });

    it('should create filter model for integer type', () => {
        const processNumberFilter = new ProcessVariableNumberFilter({
            data: {
                processDefinitionKey: 'processDefinitionKey',
                variableName: 'variableName',
                variableType: 'integer',
                operator: 'eq',
            },
            name: 'name',
            translationKey: 'name',
            value: {
                value1: 1,
                value2: null,
                operator: NumberFilterOperatorType.EQUALS,
            },
            visible: true,
        });

        const expectedModel: ProcessVariableFilterModelExtension = {
            data: NumberFilterOperatorType.EQUALS,
            name: processNumberFilter.data.variableName,
            processDefinitionKey: processNumberFilter.data.processDefinitionKey,
            type: processNumberFilter.data.variableType,
            operator: 'eq',
            value: 1,
        };

        const model = processVariableModelCreatorService.createProcessVariableFilters([processNumberFilter]);
        expect(model).toEqual([expectedModel]);
    });

    it(`should create filter model for ${NumberFilterOperatorType.BETWEEN} integer type`, () => {
        const processNumberFilter = new ProcessVariableNumberFilter({
            data: {
                processDefinitionKey: 'processDefinitionKey',
                variableName: 'variableName',
                variableType: 'integer',
                operator: 'eq',
            },
            name: 'name',
            translationKey: 'name',
            value: {
                value1: 1,
                value2: 2,
                operator: NumberFilterOperatorType.BETWEEN,
            },
            visible: true,
        });

        const expectedGreaterThenModel: ProcessVariableFilterModelExtension = {
            data: NumberFilterOperatorType.BETWEEN,
            name: processNumberFilter.data.variableName,
            processDefinitionKey: processNumberFilter.data.processDefinitionKey,
            type: processNumberFilter.data.variableType,
            operator: 'gte',
            value: 1,
        };

        const expectedLessThenModel: ProcessVariableFilterModelExtension = {
            data: NumberFilterOperatorType.BETWEEN,
            name: processNumberFilter.data.variableName,
            processDefinitionKey: processNumberFilter.data.processDefinitionKey,
            type: processNumberFilter.data.variableType,
            operator: 'lte',
            value: 2,
        };

        const model = processVariableModelCreatorService.createProcessVariableFilters([processNumberFilter]);
        expect(model).toEqual([expectedGreaterThenModel, expectedLessThenModel]);
    });

    it(`should create filter model for ${DateCloudFilterType.WEEK} date type`, () => {
        const processDateFilter = new ProcessVariableDateFilter({
            data: {
                processDefinitionKey: 'processDefinitionKey',
                variableName: 'variableName',
                variableType: 'date',
                operator: '',
            },
            name: 'name',
            translationKey: 'name',
            value: {
                range: null,
                selectedOption: {
                    value: DateCloudFilterType.WEEK,
                    label: 'FILTERS.DATE_FILTER.WEEK',
                },
            },
            options: DATE_OPTIONS,
            visible: true,
        });

        const expectedGreaterThenModel: ProcessVariableFilterModelExtension = {
            data: DateCloudFilterType.WEEK,
            name: processDateFilter.data.variableName,
            processDefinitionKey: processDateFilter.data.processDefinitionKey,
            type: processDateFilter.data.variableType,
            operator: 'gte',
            value: '2020-01-20',
        };

        const expectedLessThenModel: ProcessVariableFilterModelExtension = {
            data: DateCloudFilterType.WEEK,
            name: processDateFilter.data.variableName,
            processDefinitionKey: processDateFilter.data.processDefinitionKey,
            type: processDateFilter.data.variableType,
            operator: 'lte',
            value: '2020-01-26',
        };

        const model = processVariableModelCreatorService.createProcessVariableFilters([processDateFilter]);
        expect(model).toEqual([expectedGreaterThenModel, expectedLessThenModel]);
    });

    it('should create filter model for boolean type', () => {
        const processBooleanFilter = new ProcessVariableRadioFilter({
            data: {
                processDefinitionKey: 'processDefinitionKey',
                variableName: 'variableName',
                variableType: 'boolean',
                operator: 'eq',
            },
            name: 'name',
            translationKey: 'name',
            value: {
                value: 'true',
                label: 'true',
            },
            visible: true,
            options: [
                { label: 'true', value: 'true' },
                { label: 'false', value: 'false' },
            ],
        });

        const expectedModel: ProcessVariableFilterModelExtension = {
            name: processBooleanFilter.data.variableName,
            processDefinitionKey: processBooleanFilter.data.processDefinitionKey,
            type: processBooleanFilter.data.variableType,
            operator: 'eq',
            value: 'true',
        };

        const model = processVariableModelCreatorService.createProcessVariableFilters([processBooleanFilter]);
        expect(model).toEqual([expectedModel]);
    });
});
