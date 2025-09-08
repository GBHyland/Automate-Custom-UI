/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ReportingApi } from '@reportportal/agent-js-playwright';
import { UtilFile, paths } from '../utils';
import { logger } from '../utils/node-logger';

const DEFAULT_OPTIONS = { allFlagsMustBeOn: true };

export class FeatureFlags {
    static async skipOrExecuteTestBasedOnFlagStatus(
        testObject,
        featureFlagNames: FeatureFlagsNames[] | FeatureFlagsNames,
        testType: 'old-functionality' | 'new-functionality',
        options: { allFlagsMustBeOn: boolean } = DEFAULT_OPTIONS
    ): Promise<void> {
        if (Array.isArray(featureFlagNames) === false) {
            featureFlagNames = [featureFlagNames];
        }

        const featureFlagStatuses = await Promise.all(featureFlagNames.map((flag) => FeatureFlags.getFeatureFlagStatus(flag)));

        if (featureFlagStatuses.includes(null)) {
            return;
        }

        const information = FeatureFlags.getFlagsInfoMessage(featureFlagNames, testType, featureFlagStatuses, options);
        logger.info(information);
        ReportingApi.setDescription(information);

        if (featureFlagStatuses.includes(true) && testType === 'old-functionality') {
            await FeatureFlags.skipTestBasedOnFlagStatus(testObject, featureFlagNames, testType, featureFlagStatuses, options);
        }

        if (options.allFlagsMustBeOn && featureFlagStatuses.includes(false) && testType === 'new-functionality') {
            await FeatureFlags.skipTestBasedOnFlagStatus(testObject, featureFlagNames, testType, featureFlagStatuses, options);
        }

        if (!options.allFlagsMustBeOn && featureFlagStatuses.every((status) => status === false) && testType === 'new-functionality') {
            await FeatureFlags.skipTestBasedOnFlagStatus(testObject, featureFlagNames, testType, featureFlagStatuses, options);
        }
    }

    private static async getFeatureFlagStatus(featureFlagName: FeatureFlagsNames): Promise<boolean | null> {
        const featureFlagJsonData = await UtilFile.readJsonFile(`${paths.rootFolder}/feature-flags.json`);

        if (Object.keys(featureFlagJsonData).length === 0) {
            logger.warn(`Feature flag data list is empty !`);
            return null;
        }

        const featureFlagStatus = featureFlagJsonData[featureFlagName];

        if (featureFlagStatus === null) {
            logger.warn(`Feature flag '${featureFlagName}' is not present in the list!`);
            return null;
        }

        return featureFlagStatus;
    }

    private static async skipTestBasedOnFlagStatus(
        testObject,
        featureFlagNames: FeatureFlagsNames[],
        testType: 'old-functionality' | 'new-functionality',
        featureFlagStatuses: boolean[],
        options: { allFlagsMustBeOn: boolean }
    ): Promise<void> {
        const description = `Test skipped. ${FeatureFlags.getFlagsInfoMessage(featureFlagNames, testType, featureFlagStatuses, options)}`;
        testObject.skip(true, description);
    }

    private static getFlagsInfoMessage(
        featureFlagNames: FeatureFlagsNames[],
        testType: 'old-functionality' | 'new-functionality',
        featureFlagStatuses: boolean[],
        options: { allFlagsMustBeOn: boolean }
    ): string {
        let flagMessage: string;
        const flagsState = [];
        if (testType === 'new-functionality') {
            const allFlagsMessage = options.allFlagsMustBeOn ? 'ALL' : 'ONE';
            flagMessage = `${allFlagsMessage} of the following feature flags must be ON`;
        }
        if (testType === 'old-functionality') {
            flagMessage = `ALL of the following feature flags must be OFF`;
        }
        featureFlagNames.forEach((flagName, index) => {
            flagsState.push(`${flagName}: ${featureFlagStatuses[index]}`);
        });
        return `Test is for verifying the '${testType}' and ${flagMessage}. Flags status: [ ${flagsState.join(', ')} ]`;
    }
}

export const FeatureFlagsNames = {
    StudioValidateUsersInProject: 'studio-validate-users-in-project',
    StudioAbilityToPlaceSectionInsideARow: 'studio-ability-to-place-section-inside-a-row',
    StudioAttachFileWidgetDefaultFolder: 'studio-attach-file-widget-default-folder',
    StudioConnectorUsageOptimization: 'studio-connector-usage-optimization',
    StudioBpmnLinkEvents: 'studio-bpmn-link-events',
    IdpPromptBasedConfiguration: 'idp-prompt-based-configuration',
    IdpConfigurableReviewAndVerification: 'idp-configurable-review-and-verification',
    IdpConfigurationOnBaseConnection: 'idp-configuration-onbase-connection',
    IdpClassVerificationDocumentUpload: 'idp-class-verification-document-upload',
    StudioFormCentricView: 'studio-form-centric-view',
    StudioEnableLocalisation: 'studio-enable-localisation',
    StudioIdpScreensSupport: 'studio-idp-screens-support',
    StudioProcessVariableFilters: 'studio-process-variables-filters',
    WorkspaceVersioning: 'workspace-versioning',
    StudioEphemeralProcessVariable: 'studio-large-process-variables',
    StudioGenerateFormFile: 'studio-generate-form-file',
    StudioAdminAnalyticsDashboard: 'studio-admin-analytics-dashboard',
    StudioAdminAnalyticsTaskDashboard: 'studio-admin-analytics-task-dashboard',
    StudioAdminAnalyticsUserDashboard: 'studio-admin-analytics-user-dashboard',
    StudioAnonymousProcessStart: 'studio-anonymous-process-start',
    StudioAnonymousProcessNewUi: 'studio-anonymous-process-new-ui',
    StudioAdminExternalPermissions: 'studio-admin-external-permissions',
    StudioCalculationsOnFormFields: 'studio-calculations-on-form-fields',
    CicGovernanceWorkspaceExtension: 'cic-governance-workspace-extension',
    StudioAuditPageFilters: 'studio-audit-page-filters',
    StudioImplementUiFormEnrichment: 'studio-implement-ui-form-enrichment',
    StudioFilterPersistenceImprovement: 'studio-filter-persistence-improvement',
    StudioRootLevelFormSections: 'studio-root-level-form-sections',
    StudioCICGovernanceConfiguration: 'cic-governance-configuration',
    StudioAgenticTasks: 'studio-agentic-task',
    StudioAutoOpenNextUserTask: 'studio-auto-open-next-user-task',
    StudioMultipleCorrelationKeysForOneProcess: 'studio-multiple-correlation-keys-for-one-process',
    StudioVariablesClassificationEnhancements: 'studio-variables-classification-enhancements',
    StudioModelingHotReload: 'studio-modeling-hot-reload',
    StudioSatoriApplicationChrome: 'studio-satori-application-chrome',
    StudioFormProcessVisibility: 'studio-form-process-visibility',
    StudioNotifyProcessAiConnectors: 'studio-notify-process-ai-connectors',
    StudioEnvironmentVariablesAndSecret: 'studio-variables-and-secrets',
    AutomateCinAgentBuilder: 'automate-cin-agent-builder',
    StudioTeamsConnectorImpersonateUserChat: 'studio-teams-connector-impersonate-user-chat',
    VersioningNewContextMenu: 'cic-versioning-new-context-menu',
    StudioUndoRedoImprovement: 'studio-undo-redo-improvement',
    IdpFormAsMetadataPanel: 'idp-form-as-metadata-panel',
    IdpReasoningFieldExtraction: 'idp-reasoning-fields',
    IdpParentChildClass: 'idp-parent-child-class',
    CicWorkspaceSatoriApplicationChrome: 'cic-workspace-satori-application-chrome',
    StudioMailNotificationsViaSmtp: 'studio-mail-notifications-via-smtp',
};
export type FeatureFlagsNames = typeof FeatureFlagsNames[keyof typeof FeatureFlagsNames];
