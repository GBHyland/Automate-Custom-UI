/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getApps, MonorepoController } from '@alfresco-dbp/monorepo/core';
import { confirm, password, select, multiselect, isCancel, cancel, group } from '@clack/prompts';
import { exit } from 'node:process';

export class SetEnvParamInquirer {
    async collectApps2Context(contexts: Record<string, any>) {
        const contextKeys = Object.keys(contexts);

        if (contextKeys.length === 0) {
            return {};
        } else if (contextKeys.length === 1) {
            return (await getApps()).reduce((acc, app) => {
                acc[app.name] = contextKeys[0];
                return acc;
            }, {});
        }

        const selectedApps = await multiselect({
            message: `Select the app(s) you want to (re)set the environment variables? '<space>' to select one, '<a>' to select all`,
            options: (await getApps()).map((app) => ({ value: app.name, label: app.name })),
            required: false,
        });

        this.handleCancel(selectedApps);

        const apps = (await getApps()).filter((app) => (selectedApps as string[]).includes(app.name));

        if (apps.length === 0) {
            return {};
        }

        const contextChoices = (def: string) => {
            return Object.keys(contexts).map((value) => {
                const label = contexts[value].__name;
                return { label, value, hint: value === def ? 'recommended' : undefined };
            });
        };

        const questions = await Promise.all(
            apps.map(async (app) => {
                const project = await MonorepoController.getMonorepoProjectAsync(app.name);
                return {
                    [app.name]: () =>
                        select({
                            message: `Select context for ${app.name}`,
                            options: contextChoices(project.defaultContext),
                            initialValue: project.defaultContext,
                        }),
                };
            })
        ).then((results) => results.reduce((acc, curr) => Object.assign(acc, curr), {}));

        const answers: Record<string, string> = await group(questions, { onCancel: this.exit.bind(this) });

        return answers;
    }

    async confirm(message: string) {
        const answer = await confirm({
            message,
            initialValue: false,
        });

        this.handleCancel(answer);
        return answer;
    }

    async password(message: string): Promise<string> {
        const answer = await password({
            message,
        });

        this.handleCancel(answer);
        return answer as string;
    }

    private handleCancel(value?: any) {
        if (isCancel(value)) {
            this.exit();
        }
    }

    private exit() {
        cancel('Operation cancelled.');
        exit(0);
    }
}
