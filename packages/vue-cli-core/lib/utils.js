const modules = ["vueVersion"];
const { ensureDirSync, createFileSync, outputFileSync } = require("fs-extra");
const path = require("path");
/**
 * @description: 获取选项模块
 * @return {*}
 */
async function getPromptModules() {
  return await Promise.all(
    modules.map(async (file) => {
      return require(`./promptModules/${file}`);
    })
  );
}

async function writeFileTree(dir, files) {
  Object.keys(files).forEach((file) => {
    const filePath = path.join(dir, file);
    ensureDirSync(path.dirname(filePath));
    outputFileSync(filePath, files[file]);
  });
}
function toShortPluginId(id) {
  return id.replace(
    /^(@vue\/cli-plugin-|@vue\/cli-|vue-cli-plugin-|vue-cli-)/,
    ""
  );
}

function extractCallDir() {
  const obj = {};
  Error.captureStackTrace(obj);
  const callSite = obj.stack.split("\n")[3];
  const nameStackRegExp = /\s\((.*):\d+:\d+\)$/;
  const fileName = callSite.match(nameStackRegExp)[1];
  return path.dirname(fileName);
}

function isString(str) {
  return typeof str === "string";
}

function isObject(obj) {
  return obj !== null && typeof obj === "object";
}

function normalizeFile(files) {
  Object.keys(files).forEach((file) => {
    const normalized = slash(file);
    if (file !== normalized) {
      files[normalized] = files[file];
      delete files[file];
    }
  });
  return files;
}

// exports.getPromptModules = getPromptModules;
module.exports = {
  writeFileTree,
  getPromptModules,
  toShortPluginId,
  extractCallDir,
  isString,
  isObject,
  normalizeFile,
};
