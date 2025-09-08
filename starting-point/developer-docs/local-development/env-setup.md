# Environment setup

## Overview

The .env file generator tool (`setenv`) simplifies the process of creating and managing `.env` files for your projects. It provides the capability to manage environment variables efficiently, change them very quickly if other environment needs to be targeted, encrypt sensitive information, and rotate secrets as needed.

## Glossary

- **Environment Variable**: A variable that holds information about settings or configurations that can change across different environments or domains. Can be either global or on app level.
- **Contexts**: A Studio Domain representing a specific APA/HXP environment in which your frontend app or E2E tests run.
- **Secret**: A variable that holds sensitive or secret information, hence it stored in an encrypted way. Secrets are stored per contexts. For the decryption a passphrase is needed.

## Usage

### Setting Environment Variables

After cloning the repository and installing the dependencies, the next thing one should do is to generate the necessary `.env` files needed for the "proper repository experience".
Run the following command. The command itself is an interactive prompt which will guide you through the setup process. You will be prompted to answer a few (or zero) questions. Before running this command, to correctly generate the secrets, you need to obtain a special password that will be prompted. Team members with LastPass access + Hx DevOps should be able to share needed creds through [kiteworks](https://hyland.kiteworks.com/):

```bash
npm run setenv
```

![hierarchical .env files](./assets/setenv.drawio.svg)

The setenv command invocation would result in various [hierarchical .env files](https://nx.dev/recipes/tips-n-tricks/define-environment-variables) accross the repository.


![That's it!](https://media.giphy.com/media/RLK2SQ1cndlTd4oA7l/giphy.gif)


The generated `.env` files are .gitignored, hence owned by the developer, so they can be changed freely (e.g.: for exploration or troubleshooting). Not even mentioning the fact, that resetting the .env files to be in consistent state again is only a matter of running the `setenv` command again.

If you want to make a permanent variable change, you need to modify one of the `json`/`json5` files, which are committed into the repository. This way the other developers working on the repo can benefit your fix/modification next time they reset their .env files. About this, see the [Technical details](#technical-details).

### Managing Secrets

#### Changing or Adding Secrets

Use the following command to update existing secrets or add new ones:

```bash
npm run secrets:set
```

This command will prompt you to enter:
- what context (environment) you want to set the secret for
- the secret (key and value)
- and password
to encrypt and save it in the `secrets.json` file.

#### Rotating Secrets

To change the encryption master passphrase for the `secrets.json` file, run:

```bash
npm run secrets:rotate
```

This command will prompt you to enter a new passphrase and re-encrypt the existing secrets using the new passphrase, enhancing the security of your secrets.

**This command will rotate the master passphrase, resulting your secrets encrypted again, it DOES NOT change your secrets.**


## Managing contexts (environments)

In some cases, it is normal that we want to add references to new environments or delete references of obsolete ones. This can be done by manually editing some files.

### Adding references to new environments

The addition of new environment references consists of 2 steps:
- Adding the must have values into the `./config/contexts.json5` file for the new environment
- Defining secrets for the environments

#### Adding a reference to a new environment

In the `./config/contexts.json5` add a new property with the id of the new environment. Let's say you want to create a reference for the newly spawned `HxP Jupiter` environment, the id of it could be: `hxpJupiter`.

At the time of writing this document, you need to specify the values can be seen below, but over time they can change. Always check the already defined environments to understand what values need to be defined for an environment, they are supposed to be identical.


```json5
{
    ...
    hxpJupiter: {
        // Since it is a json5 file, you can use comments
        __name: "HxP Jupiter", // Human readable name of the environment
        contentHost: "...",
        processHost: "...",
        idpURL: "...",
        identityURL: "...",
        "accountId": "...",
        "deployedApps": []
    },
    ...
}
```


#### Defining secrets for the newly referenced environment

For defining secrets for the newly created environment, just follow [this](#changing-or-adding-secrets).

### Deleting and existing environment reference

For delete an existing environment do the following:

1. Delete the environment key property and its values from the the `./config/contexts.json5` file.
2. Delete the environment key property and its defined secrets from the the `./config/secrets.json` file.

## Technical details

### Configuration Files

#### Contexts (environments)

- The `./config/contexts.json5` file serves as the primary configuration file for storing environment specific information to a given Studio Domain.
- The information stored in this file is used via the `setenv` tool to configure your application(s) based on the selected Context.

#### Global variables

- The `./config/global-variables.default.json5` file defines global variables that are common across all environments and are unrelated to any specific Context or application. These global variables should only be modified if necessary, since such a change would affect every application, e2e or setting.

##### Global variable variants

Besides the default global variables, variants can be created as well. A variant is a set of variables which can be choosen to be loaded on top of the default variables, overwriting the existing variables. At the same time (per setenv invocation) only one variant can be used (but not necessarily used).

Variants can be selected through setting a specific environment variable: `SETENV_OVERRIDE`

Considering you want to run the setenv command, using a specific "chimichanga" variant, you need to run the following command:

```bash
SETENV_OVERRIDE=chimichanga npm run setenv
```

If you have the default variant set in the `./config/global-variables.default.json5`:

```json5
{
  protractor: {
    MAXINSTANCES: 1,
    FOO: 'foo'
  }
}
```

And have this chimichanga variant in `./config/global-variables.chimichanga.json5`:

```json5
{
  protractor: {
    MAXINSTANCES: 2,
    BAR: 'bar'
  }
}
```

the output result - in the root level `.env` - of the variant invoked `setenv` command would be:

```bash
# protractor
MAXINSTANCES=2  # <- coming from the chimichanga variant as override
FOO="foo"       # <- coming from the default variant
BAR="bar"       # <- coming from the chimichanga variant
```

As it can be seen the SETENV_OVERRIDE might identify some files (one on global level, one on app level, see this below...) at the end, which the script looks for, and loads it in case it exists.

##### Exceptional variant: CI

There is one specific variant, where you don't need to set the `SETENV_OVERRIDE` explicitly, however it still kicks in: the **ci** variant!

This variant is loaded automagically when the `CI` environment variable is set to true. (Usually on every CI provider on the planet).

So with this addition, the final form of the variable load & merge pipe is the following:

|Precedence order|
|:---:|
|`your specified variant`<br />(if the env var is set and the file exists)|
|▼|
|`ci variant`<br />(if CI is true and the file exists)|
|▼|
|`default variant`|

As the above example demonstrates, if you set the SETENV_OVERRIDE, it will win over any default or CI related settings.

CI project variables can be set in `apps/<app-name>/project.variables.ci.json5` (please note the `ci` in the file name)

```json
{
  "variables": {
    "VARIABLE_USED_ONLY_BY_CI": "SOME_VALUE", // you can use context here as well!
  },
}

```

#### App specific variables

- The `./apps/app/<app-name>/project.variables.json5` files define app related variables that are specific to only that particular application.

Whenever a new app.config.json related variable needs to be added, changed, deleted, this is the file where the change can be made permanent.

##### Context aware variable values

For app specific variables, you can define values which are dynamically based on the selected context and not hardcoded.

So instead of:

```json5
{
  variables: {
    APP_CONFIG_BPM_HOST: 'http://localhost:4200'
  }
}
```

you can rely on the context, and access properties of the selected context object:

```json5
{
  variables: {
    APP_CONFIG_BPM_HOST: '{context.processHost}',
  }
}
```

The available properties can differ per context! See the contexts.json5 file in the root's config folder.

##### App specific variable variants

All the rules which were stated for global variable variants apply here as well.

Variants for app specific variables can be used as well, the same way as for global variables. The only slight difference is in the naming of the `default` variant:
- in case of global variables: `./config/global-variables.default.json5`
- in case of app specific variables: `./apps/app/<app-name>/project.variables.json5`

To specify a chimichanga variant for an app, you need to create the following file:

`./apps/app/<app-name>/project.variables.chimichanga.json5`


#### Secrets

- The `./config/secrets.json` file is used to securely store sensitive information that requires encryption.
- This file is where you manage secrets such as test user emails and passwords, and other confidential data.
- This file stores the secrets grouped by contexts.
- Manual editing of this file is not recommended, unless deleting a secret. The `npm run secrets:set` tool is supposed to be used for upserting secrets.
- Handle this file with utmost care as it contains sensitive information.
- **In this file, only those secrets are supposed to be stored, which are absolutely necessary for local development!** Secrets used only on CI belongs to Github Secret Manager.
