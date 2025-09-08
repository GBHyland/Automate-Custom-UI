/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface ActuatorHealthStatus {
    status: string;
    components: Component;
    groups: string[];
}

interface Component {
    binders: Status;
    discoveryComposite: Status;
    diskSpace: Status;
    identity: Status;
    livenessState: Status;
    ping: Status;
    rabbit: Status;
    reactiveDiscoveryClients: Status;
    readinessState: Status;
    refreshScope: Status;
}

interface Status {
    status: string;
    details?: any;
    components?: any;
    description?: string;
}

export interface KubernetesHealthStatus {
    name: string;
    deployments: Deployments[];
    status: string;
}

interface Deployments {
    name: string;
    healthEndpoint: string;
    pods: Pods[];
    status: string;
}

interface Pods {
    name: string;
    podConditions: any;
    containerStatuses: any[];
    status: string;
}
