/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

const path = require('path');
const fs = require('fs');
const ts = require('typescript');

// See https://github.com/microsoft/TypeScript/issues/44573#issuecomment-861843319
function reportDiagnostics(diagnostics) {
    diagnostics.forEach(diagnostic => {
        let message = "Error";
        if (diagnostic.file && diagnostic.start) {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
        }
        message += ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(message);
    });
}

// See https://github.com/microsoft/TypeScript/issues/44573#issuecomment-861843319
function readConfigFile(configFileName) {
    const configFileText = fs.readFileSync(configFileName).toString();
    const result = ts.parseConfigFileTextToJson(configFileName, configFileText);
    const configObject = result.config;

    if (!configObject) {
        if (result.error) {
            reportDiagnostics([result.error]);
        }
        process.exit(1);
    }

    const configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName));
    if (configParseResult.errors.length > 0) {
        reportDiagnostics(configParseResult.errors);
        process.exit(1);
    }
    return configParseResult;
}

module.exports = function getPathMappingsRelativeToCurrentRoot(tsConfigFileDirectoryPath, tsConfigFilePath) {
    const configFile = readConfigFile(tsConfigFilePath);
    const pathMappings = configFile.options.paths;

    return Object.keys(pathMappings)
        .map(alias => ({ alias, paths: pathMappings[alias] }))
        .map(({ alias, paths }) => ({
            alias,
            paths: paths.map(pathAlias => path.relative(tsConfigFileDirectoryPath, pathAlias))
        }))
        .reduce((acc, item) => ({ ...acc, [item.alias]: item.paths }), {});
}
