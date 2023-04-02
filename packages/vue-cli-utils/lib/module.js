const Module = require("module");
const path = require("path");

function loadModule(request, context) {
  return Module.createRequire(path.resolve(context, "package.json"))(request);
}
module.exports = { loadModule };
