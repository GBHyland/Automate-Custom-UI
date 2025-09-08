import fs from 'fs';
import { merge } from 'es-toolkit';
import { fileURLToPath } from 'url';
import path from 'path';

const WRAPPER_BEGIN = '"<<<___';
const WRAPPER_END = '___>>>"';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURRENT_DIR = __dirname;
const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(__dirname, '.tmp');

function wrapVars(path) {
    // Can not require, since it might not be a valid json because of env var substitutions
    const jsonConfigTemplate = fs.readFileSync(path, 'utf-8');
    // We need to wrap the invalid parts to make it a valid JSON object
    const validJsonObject = jsonConfigTemplate.replace(/:\s*(\$\{?[a-zA-Z0-9_]*}?)/g, `: ${WRAPPER_BEGIN}$1${WRAPPER_END}`);
    return JSON.parse(validJsonObject);
}

function unwrapVars(jsonObject) {
    // Remove previously wrappers
    return JSON.stringify(jsonObject, null, 2).replace(new RegExp(WRAPPER_BEGIN, 'g'), '').replace(new RegExp(WRAPPER_END, 'g'), '');
}

function forgeAppConfigJson(rootConfigPath, appConfigOutputPath, processServiceExtPath) {
    let appADWConfig = wrapVars(rootConfigPath);

    if (processServiceExtPath) {
        const processServiceExtConfig = wrapVars(processServiceExtPath);
        appADWConfig = merge(appADWConfig, processServiceExtConfig);
    }

    const projectInfoPath = path.join(__dirname, 'project.info.json');
    const projectInfo = JSON.parse(fs.readFileSync(projectInfoPath, 'utf-8'));
    appADWConfig.application.version = projectInfo.deploy?.releaseVersion || '0.0.1';

    fs.writeFileSync(appConfigOutputPath, unwrapVars(appADWConfig));
}

if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR);

forgeAppConfigJson(
    path.join(CURRENT_DIR, 'src/app.config.json.tpl'),
    path.join(OUTPUT_DIR, 'app.config.json.tpl'),
    path.join(WORKSPACE_ROOT, 'libs/content-ee/process-services-cloud-extension/src/app.config-extension.json.tpl')
);

fs.copyFileSync(path.join(OUTPUT_DIR, 'app.config.json.tpl'), path.join(OUTPUT_DIR, 'app.config.json'));
