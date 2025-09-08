/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService } from '../base.service';
import { CustomAPIRequest } from '../../context-factory/context.models';
import { ProjectsEndpoint, ReleasesEndpoint, ModelsEndpoint } from './endpoints';
import { FeatureFlagsEndpoint } from '..';
import {
    Connector,
    ContentModel,
    ContentType,
    CustomWidgets,
    DataModel,
    DecisionTable,
    Form,
    File,
    FormWidget,
    Mixin,
    ModelVariation,
    Process,
    Rendition,
    Schema,
    Script,
    SecurityPolicy,
    Trigger,
    Ui,
    Authentication,
    IdpConfiguration,
    GovernanceConfiguration,
    Agent,
} from './models';

export class ModelingService extends BaseService {
    serviceUrl = '/modeling-service';
    featureFlags: FeatureFlagsEndpoint;
    releases: ReleasesEndpoint;
    projects: ProjectsEndpoint;
    process: ModelsEndpoint;
    agent: ModelsEndpoint;
    connector: ModelsEndpoint;
    form: ModelsEndpoint;
    formWidget: ModelsEndpoint;
    decisionTable: ModelsEndpoint;
    ui: ModelsEndpoint;
    script: ModelsEndpoint;
    trigger: ModelsEndpoint;
    file: ModelsEndpoint;
    contentModel: ModelsEndpoint;
    customWidgets: ModelsEndpoint;
    dataModel: ModelsEndpoint;
    rendition: ModelsEndpoint;
    schema: ModelsEndpoint;
    mixin: ModelsEndpoint;
    contentType: ModelsEndpoint;
    securityPolicy: ModelsEndpoint;
    authentication: ModelsEndpoint;
    idpConfiguration: ModelsEndpoint;
    governanceConfiguration: ModelsEndpoint;

    constructor(context: CustomAPIRequest) {
        super(context);
        this.featureFlags = new FeatureFlagsEndpoint(context, this.serviceUrl);
        this.releases = new ReleasesEndpoint(context, this.serviceUrl);
        this.projects = new ProjectsEndpoint(context, this.serviceUrl);
        this.process = this.createModelApi(new Process(), this.serviceUrl);
        this.agent = this.createModelApi(new Agent(), this.serviceUrl);
        this.connector = this.createModelApi(new Connector(), this.serviceUrl);
        this.decisionTable = this.createModelApi(new DecisionTable(), this.serviceUrl);
        this.form = this.createModelApi(new Form(), this.serviceUrl);
        this.formWidget = this.createModelApi(new FormWidget(), this.serviceUrl);
        this.ui = this.createModelApi(new Ui(), this.serviceUrl);
        this.script = this.createModelApi(new Script(), this.serviceUrl);
        this.trigger = this.createModelApi(new Trigger(), this.serviceUrl);
        this.file = this.createModelApi(new File(), this.serviceUrl);
        this.contentModel = this.createModelApi(new ContentModel(), this.serviceUrl);
        this.customWidgets = this.createModelApi(new CustomWidgets(), this.serviceUrl);
        this.dataModel = this.createModelApi(new DataModel(), this.serviceUrl);
        this.rendition = this.createModelApi(new Rendition(), this.serviceUrl);
        this.schema = this.createModelApi(new Schema(), this.serviceUrl);
        this.mixin = this.createModelApi(new Mixin(), this.serviceUrl);
        this.contentType = this.createModelApi(new ContentType(), this.serviceUrl);
        this.securityPolicy = this.createModelApi(new SecurityPolicy(), this.serviceUrl);
        this.authentication = this.createModelApi(new Authentication(), this.serviceUrl);
        this.idpConfiguration = this.createModelApi(new IdpConfiguration(), this.serviceUrl);
        this.governanceConfiguration = this.createModelApi(new GovernanceConfiguration(), this.serviceUrl);
    }

    private createModelApi<T>(modelVariationInstance: ModelVariation<T>, serviceUrl: string) {
        return new ModelsEndpoint<T>(modelVariationInstance, this.context, serviceUrl);
    }
}
