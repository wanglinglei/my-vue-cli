"use strict";

const { loadModule } = require("./module.js");

const pluginReg = /@vue\/cli-plugin-/;

function isPlugin(plugin) {
  return pluginReg.test(plugin);
}

module.exports = {
  loadModule,
  isPlugin,
};
