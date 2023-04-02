'use strict';

const vueCliUtils = require('..');
const assert = require('assert').strict;

assert.strictEqual(vueCliUtils(), 'Hello from vueCliUtils');
console.info('vueCliUtils tests passed');
