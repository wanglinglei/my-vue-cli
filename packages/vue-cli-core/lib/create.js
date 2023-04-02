const path = require("path");
const { getPromptModules } = require("./utils");
const Creator = require("./creator");
async function create(projectName) {
  console.log("create", projectName);
  // 获取当前的工作目录
  let cwd = process.cwd();
  const name = projectName;
  // 目标目录
  const targetDir = path.resolve(cwd, name);
  // 获取选项模块
  let promptModules = await getPromptModules();
  const creator = new Creator(name, targetDir, promptModules);
  creator.create();
}

module.exports = (...args) => {
  return create(...args).catch((err) => {
    console.log(err);
  });
};
