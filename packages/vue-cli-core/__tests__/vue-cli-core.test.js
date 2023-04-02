'use strict';

const vueCliCore = require('..');
const assert = require('assert').strict;

assert.strictEqual(vueCliCore(), 'Hello from vueCliCore');
console.info('vueCliCore tests passed');
