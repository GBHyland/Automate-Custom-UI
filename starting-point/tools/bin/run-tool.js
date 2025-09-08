#!/usr/bin/env node

const resolve = require('path').resolve;
const runCommand = require('../shared/es5/run-command');

runCommand(resolve(__dirname, '..'));
