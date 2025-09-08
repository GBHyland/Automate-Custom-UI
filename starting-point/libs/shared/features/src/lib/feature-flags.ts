/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const STUDIO_HXP = {
    STUDIO_CONTENT_MODEL_IMPROVEMENTS: 'studio-content-model-constraints-improvements',
    ONBASE_CONNECTOR: 'studio-onbase-connector',
    ACS_CONNECTOR: 'studio-acs-connector',
    PERCEPTIVE_CONNECTOR: 'studio-perceptive-connector',
    CONTENT_DOWNLOAD_URL: 'content-external-uri-blob-creation',
    ATTACH_FILE_WIDGET_DEFAULT_FOLDER: 'studio-attach-file-widget-default-folder',
    SECURITY_POLICY_API: 'content-security-policy',
    STUDIO_SET_PERMISSIONS_ON_CONTENT_CREATION: 'studio-set-permissions-content-creation',
    STUDIO_LINK_EVENTS_SUPPORT: 'studio-bpmn-link-events',
    MS_MAIL_CONNECTOR: 'studio-msmail-connector',
    OPEN_AI_CONNECTOR: 'studio-open-ai-connector',
    AGENTIC_AI_CONNECTOR: 'studio-agentic-task',
    AUTOMATE_CIN_AGENT_BUILDER: 'automate-cin-agent-builder',
    STUDIO_IDP_SCREENS_SUPPORT: 'studio-idp-screens-support',
    BUILD_FORMS_VIA_CHAT_PROMPT: 'studio-build-forms-via-chat-prompt',
    FILE_STORAGE_IN_S3: 'studio-file-storage-in-s3',
    STUDIO_MODELING_HOT_RELOAD: 'studio-modeling-hot-reload',
    STUDIO_AI_CREATE_CONNECTOR_SILENTLY: 'studio-ai-create-connector-silently',
    EXTERNAL_DYNAMIC_CONNECTOR: 'studio-external-dynamic-connector',
    STUDIO_AI_REFINE_PROCESS: 'studio-ai-refine-process',
    STUDIO_NOTIFY_PROCESS_AI_CONNECTORS: 'studio-notify-process-ai-connectors',
    STUDIO_VARIABLES_AND_SECRETS: 'studio-variables-and-secrets',
    STUDIO_ENVIRONMENT_SECRETS: 'studio-environment-secrets',
    STUDIO_ATTACH_FILE_PERMISSIONS_DIALOG: 'studio-attach-file-permissions-dialog',
} as const;
export type STUDIO_HXP = typeof STUDIO_HXP[keyof typeof STUDIO_HXP];

export const STUDIO_SHARED = {
    STUDIO_DECIMAL_NUMBERS: 'studio-decimal-numbers',
    ENABLE_LOCALISATION: 'studio-enable-localisation',
    FORM_CENTRIC_VIEW: 'studio-form-centric-view',
    STUDIO_FORM_PROCESS_DEPENDENCY: 'studio-form-process-dependency',
    STUDIO_AUDIT_PAGE_FILTERS: 'studio-audit-page-filters',
    STUDIO_LARGE_PROCESS_VARIABLES: 'studio-large-process-variables',
    STUDIO_CALCULATIONS_ON_FORM_FIELDS: 'studio-calculations-on-form-fields',
    STUDIO_IMPLEMENT_UI_FORM_ENRICHMENT: 'studio-implement-ui-form-enrichment',
    STUDIO_JSON_PATCH_OUTPUT_MAPPING_IMPROVEMENTS: 'studio-json-patch-output-mapping-improvements',
    STUDIO_PUBLIC_PROCESS_REDIRECT: 'studio-public-process-redirect',
    STUDIO_VARIABLES_CLASSIFICATION_ENHANCEMENTS: 'studio-variables-classification-enhancements',
    STUDIO_ABILITY_TO_PLACE_SECTION_INSIDE_A_ROW: 'studio-ability-to-place-section-inside-a-row',
    STUDIO_MULTIPLE_CORRELATION_KEYS_FOR_ONE_PROCESS: 'studio-multiple-correlation-keys-for-one-process',
    STUDIO_CONFIGURABLE_DEFAULT_FORM_BUTTON: 'studio-configurable-default-form-buttons',
    STUDIO_USER_TASK_REDIRECT_BASED_ON_FORM_OUTCOME: 'studio-user-task-redirect-based-on-form-outcome',
    STUDIO_FORM_PROCESS_VISIBILITY: 'studio-form-process-visibility',
    STUDIO_MAIL_USER_TASK_LEVEL: 'studio-mail-user-task-level',
    STUDIO_UNDO_REDO_IMPROVEMENT: 'studio-undo-redo-improvement',
    STUDIO_ROOT_LEVEL_FORM_SECTIONS: 'studio-root-level-form-sections',
} as const;
export type STUDIO_SHARED = typeof STUDIO_SHARED[keyof typeof STUDIO_SHARED];

export const ADMIN_HXP = {
    STUDIO_ADMIN_ANALYTICS_DASHBOARD: 'studio-admin-analytics-dashboard',
    STUDIO_ADMIN_ANALYTICS_USER_DASHBOARD: 'studio-admin-analytics-user-dashboard',
    STUDIO_ADMIN_ANALYTICS_TASK_DASHBOARD: 'studio-admin-analytics-task-dashboard',
    STUDIO_LARGE_PROCESS_VARIABLES: 'studio-large-process-variables',
    STUDIO_ADMIN_EXTERNAL_PERMISSIONS: 'studio-admin-external-permissions',
    STUDIO_ANONYMOUS_PROCESS_NEW_UI: 'studio-anonymous-process-new-ui',
    STUDIO_VARIABLES_AND_SECRETS: 'studio-variables-and-secrets',
    STUDIO_ENVIRONMENT_SECRETS: 'studio-environment-secrets',
    STUDIO_ADMIN_ANALYTICS_IDP_DASHBOARD: 'studio-admin-analytics-idp-dashboard',
} as const;
export type ADMIN_HXP = typeof ADMIN_HXP[keyof typeof ADMIN_HXP];

export const SHARED_HXP = {
    STUDIO_SATORI_APPLICATION_CHROME: 'studio-satori-application-chrome',
    STUDIO_MAIL_NOTIFICATIONS_VIA_SMTP: 'studio-mail-notifications-via-smtp',
};
export type SHARED_HXP = typeof SHARED_HXP[keyof typeof SHARED_HXP];

export const ADMIN_SHARED = {
    ENABLE_REDEPLOY: 'studio-enable-redeploy',
    STUDIO_MANAGE_CONNECTORS: 'studio-manage-connectors',
    STUDIO_FILTER_PERSISTENCE_IMPROVEMENT: 'studio-filter-persistence-improvement',
} as const;
export type ADMIN_SHARED = typeof ADMIN_SHARED[keyof typeof ADMIN_SHARED];

export const IDP = {
    PROMPT_BASED_CONFIG: 'idp-prompt-based-configuration',
    CONFIGURABLE_REVIEW_AND_VERIFICATION: 'idp-configurable-review-and-verification',
    CONFIGURATION_ONBASE_CONNECTION: 'idp-configuration-onbase-connection',
    CLASS_VERIFICATION_DOCUMENT_UPLOAD: 'idp-class-verification-document-upload',
    PARENT_CHILD_CLASS: 'idp-parent-child-class',
    FORM_AS_METADATA_PANEL: 'idp-form-as-metadata-panel',
    REASONING_FIELD: 'idp-reasoning-fields',
    CLASSIFICATION_SETTINGS: 'idp-classification-settings',
} as const;

export const CICGOV = {
    CONFIGURATION: 'cic-governance-configuration',
} as const;

export const RPA = {
    AGENTIC_AI_PROCESS: 'rpa-agentic-ai-task-automation',
} as const;
export type RPA = typeof RPA[keyof typeof RPA];
