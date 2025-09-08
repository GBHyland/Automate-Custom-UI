{
    "plugins": {
        "processAutomation": true
    },
    "adf-cloud-start-process": {
        "name": "%{processDefinition} - %{datetime}",
        "processDefinitionName": ""
    },
    "dateValues": {
        "defaultDateFormat": "mediumDate",
        "defaultTooltipDateFormat": "medium",
        "defaultDateTimeFormat": "MMM d, y, h:mm",
        "defaultLocale": "en"
    },
    "totalQuickStartProcessDefinitions": 5,
    "adf-cloud-process-header": {
        "defaultDateFormat": "medium",
        "presets": {
            "properties": [
                "name",
                "status",
                "initiator",
                "startDate",
                "lastModified",
                "businessKey"
            ]
        }
    },
    "adf-cloud-task-header": {
        "defaultDateFormat": "medium"
    },
    "adf-cloud-process-filter-config": {
        "filterProperties": [
            "status",
            "sort",
            "order",
            "processName",
            "processDefinitionName",
            "initiator",
            "completedDateRange",
            "startedDateRange",
            "suspendedDateRange",
            "appVersionMultiple"
        ],
        "sortProperties": [
            "name",
            "status",
            "startDate",
            "initiator",
            "processDefinitionName"
        ],
        "actions": [
            "save",
            "saveAs",
            "delete"
        ]
    },
    "adf-edit-task-filter": {
        "filterProperties": [
            "processDefinitionName",
            "taskName",
            "status",
            "sort",
            "order",
            "priority",
            "dueDateRange",
            "completedDateRange",
            "createdDateRange",
            "completedBy"
        ],
        "sortProperties": [
            "id",
            "name",
            "createdDate",
            "dueDate",
            "status",
            "priority",
            "processDefinitionId",
            "processDefinitionName"
        ],
        "actions": [
            "save",
            "saveAs",
            "delete"
        ]
    }
}
