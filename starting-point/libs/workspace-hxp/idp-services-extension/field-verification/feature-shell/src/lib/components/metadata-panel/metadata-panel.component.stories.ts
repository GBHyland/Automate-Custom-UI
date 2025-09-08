/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Meta, moduleMetadata } from '@storybook/angular';
import { MetadataPanelComponent } from './metadata-panel.component';
import { MatIconModule } from '@angular/material/icon';
import { I18nModule } from '../../configs/storybook/i18n.module';
import { ActionHistoryService, ActionLinearHistoryService } from '../../services/action-history.service';

export default {
    title: 'MetadataPanelComponent',
    component: MetadataPanelComponent,
    decorators: [
        moduleMetadata({
            imports: [MatIconModule, I18nModule],
            providers: [{ provide: ActionHistoryService, useClass: ActionLinearHistoryService }],
        }),
    ],
    // eslint-disable-next-line prettier/prettier
} satisfies Meta<MetadataPanelComponent>;

export const NoEntries = {
    render: (args: MetadataPanelComponent) => ({
        props: args,
    }),
    args: {
        fields: [],
    },
};

export const ValidExtractionData = {
    render: (args: MetadataPanelComponent) => ({
        props: args,
    }),
    args: {
        fields: [
            {
                id: '1',
                name: 'employee_name',
                sanitizedName: 'Employee Name',
                value: 'Cosmo Kramer',
                inputType: 'string',
                verificationStatus: 'autoExtracted',
                hasIssue: false,
                confidence: 0.9,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
            {
                id: '2',
                name: 'job_title',
                sanitizedName: 'Job Title',
                value: 'Baker',
                inputType: 'string',
                verificationStatus: 'autoExtracted',
                hasIssue: false,
                confidence: 0.9,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
            {
                id: '3',
                name: 'employee_type',
                sanitizedName: 'Employee Type',
                value: 'Full Time',
                inputType: 'string',
                verificationStatus: 'autoExtracted',
                hasIssue: false,
                confidence: 0.9,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
            {
                id: '4',
                name: 'employer_name',
                sanitizedName: 'Employer Name',
                value: 'H&H Bagels',
                inputType: 'string',
                verificationStatus: 'autoExtracted',
                hasIssue: false,
                confidence: 0.9,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
            {
                id: '5',
                name: 'hourly_rate',
                sanitizedName: 'Hourly Rate',
                value: '$3.35',
                inputType: 'currency',
                verificationStatus: 'autoExtracted',
                hasIssue: false,
                confidence: 0.4,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
            {
                id: '6',
                name: 'hire_date',
                sanitizedName: 'Date of Hire',
                value: '1997-12-18',
                inputType: 'date',
                verificationStatus: 'autoExtracted',
                hasIssue: false,
                confidence: 0.9,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
        ],
    },
};

export const ImperfectExtractionData = {
    render: (args: MetadataPanelComponent) => ({
        props: args,
    }),
    args: {
        fields: [
            {
                id: '1',
                name: 'employee_name',
                sanitizedName: 'Employee Name',
                value: 'Harold Smith',
                inputType: 'string',
                verificationStatus: 'autoExtracted',
                hasIssue: false,
                confidence: 0.9,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
            {
                id: '2',
                name: 'job_title',
                sanitizedName: 'Job Title',
                value: '',
                inputType: 'string',
                verificationStatus: 'notExtracted',
                hasIssue: true,
                confidence: 0.9,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
            {
                id: '3',
                name: 'employee_type',
                sanitizedName: 'Employee Type',
                value: 'Full Time',
                inputType: 'string',
                verificationStatus: 'autoExtracted',
                hasIssue: false,
                confidence: 0.9,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
            {
                id: '4',
                name: 'salary_rate',
                sanitizedName: 'Salary Rate',
                value: '$250,000.00',
                inputType: 'currency',
                verificationStatus: 'autoExtracted',
                hasIssue: false,
                confidence: 0.4,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
            {
                id: '5',
                name: 'net_wage_amount',
                sanitizedName: 'Net Wage Amount',
                value: '$660.00',
                inputType: 'currency',
                verificationStatus: 'manuallyValid',
                hasIssue: false,
                confidence: 0.9,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
            {
                id: '6',
                name: 'payment_date',
                sanitizedName: 'Payment Date',
                value: '2024-10-25',
                inputType: 'date',
                verificationStatus: 'autoExtracted',
                hasIssue: true,
                confidence: 0.9,
                pageId: '1',
                boundingBox: { top: 0.1, left: 0.1, width: 0.1, height: 0.1 },
            },
        ],
    },
};
