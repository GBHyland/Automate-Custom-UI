const Ajv = require('ajv');
const fs = require('fs');

const schemaPath = process.argv[2];
const configPath = process.argv[3];

if (!schemaPath || !configPath) {
    console.error('Usage: node <path-to-validate-app-config.js> <path-to-schema.json> <path-to-app-config.json>');
    process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const ajv = new Ajv({ allErrors: true, verbose: true });
const validate = ajv.compile(schema);

if (validate(data)) {
    console.log('App config validation succeeded.');
    process.exit(0);
} else {
    console.error('App config validation failed:');
    console.error(validate.errors);
    console.error('\x1b[0;32mSuggestion\x1b[0m: Try to reset the .env by running \x1b[0;31mnpm run setenv\x1b[0m');
    process.exit(1);
}
