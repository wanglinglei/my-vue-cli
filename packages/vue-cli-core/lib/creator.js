const PromptModuleApi = require("./promptModuleApi.js");
const defaults = require("./options.js");
const inquirer = require("inquirer");
const cloneDeep = require("lodash/cloneDeep");
const chalk = require("chalk");
const { writeFileTree } = require("./utils");
const execa = require("execa");
const { loadModule } = require("vue-cli-utils");
const { Generator } = require("./generator");

const isManualMode = (answers) => answers.preset === "_manual_";
class Creator {
  constructor(name, context, promptModules) {
    this.name = name;
    this.context = context;
    this.promptModules = promptModules;
    // 添加了新的特性后 有后续选择时添加
    this.injectedPrompts = [];
    // 选择所有选项后的回调
    this.promptCompleteCallbacks = [];

    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts();
    this.presetPrompt = presetPrompt;
    this.featurePrompt = featurePrompt;
    const PromptApi = new PromptModuleApi(this);
    promptModules.forEach((module) => {
      module(PromptApi);
    });
  }
  async create() {
    const { name, context } = this;
    let answers = await this.promptAndResolvePresets();
    let preset;
    if (answers.preset && answers.preset !== "_manual_") {
      // 默认配置
      preset = await this.resolvePreset(answers.preset);
    } else {
      // 选择手动配置  插件配置为空 根据选择结果插入
      preset = {
        plugins: {},
      };
      answers.feature = answers.feature || [];
      this.promptCompleteCallbacks.forEach((callback) => {
        callback(answers, preset);
      });
    }
    preset = cloneDeep(preset);
    // 添加核心模块
    preset.plugins["@vue/cli-service"] = Object.assign(
      { projectName: name },
      preset
    );
    console.log(`😶 Create project in ${chalk.yellow(context)}.`);
    // 生成项目package.json
    const pkg = {
      name,
      version: "0.1.0",
      private: true,
      devDependencies: {},
    };
    const deps = Object.keys(preset.plugins);
    deps.forEach((dep) => {
      pkg.devDependencies[dep] = "latest";
    });
    await writeFileTree(context, {
      "package.json": JSON.stringify(pkg, null, 2),
    });
    console.log(`🚀  Invoking generators...`);
    await this.run("git init"); // 初始化仓库
    console.log("🐝 Installing CLI plugins. this might take a while...");
    await this.run("npm install"); // 安装依赖
    console.log("🚀 Invoking generator ...");
    const plugins = await this.resolvePlugins(preset.plugins);
    // 创建生成器
    const generator = new Generator(context, { pkg, plugins });
    generator.generator();
  }

  async resolvePlugins(rawPlugins) {
    const plugins = [];
    for (const id of Object.keys(rawPlugins)) {
      const apply = loadModule(`${id}/generator`, this.context);
      let options = rawPlugins[id];
      // @note id：插件名称 apply 插件里导出的函数 options 插件的配置项
      plugins.push({ id, apply, options });
    }
    return plugins;
  }
  /**
   * @description: 在当前目录执行命令
   * @param {*} command
   * @return {*}
   */
  async run(command, args) {
    return execa(command, args, { cwd: this.context });
  }

  async promptAndResolvePresets() {
    const finalPrompts = this.resolveFinalPrompts();
    let answers = await inquirer.prompt(finalPrompts);
    return answers;
  }
  resolveFinalPrompts() {
    this.injectedPrompts.forEach((prompt) => {
      let originWhen = prompt.when || (() => true);
      prompt.when = (answers) => {
        // 是手动模式 并且牵制选择完成后才会弹出
        return isManualMode && originWhen(answers);
      };
    });
    let prompts = [
      this.presetPrompt, // 选择预设
      this.featurePrompt, //  选对应特性
      ...this.injectedPrompts, // 不同的promptModule插入选项
    ];
    return prompts;
  }
  /**
   * @description: 获取预设
   * @return {*}
   */
  getPresets() {
    return Object.assign({}, defaults);
  }
  /**
   * @description: 选择预设配置
   * @description: 自动模式 or 手动模式
   * @return {*}
   */
  resolveIntroPrompts() {
    let presets = this.getPresets();
    const presetChoices = Object.entries(presets).map(([name]) => {
      let displayName = name;
      if (name === "default") {
        displayName = "Default";
      } else if (name === "_default_vue3") {
        displayName = "Default (vue3)";
      }
      return {
        name: `${displayName}`,
        value: name,
      };
    });

    const presetPrompt = {
      name: "preset",
      type: "list",
      message: "please select a preset",
      choices: [
        ...presetChoices,
        {
          name: "Manually select feature",
          value: "_manual_",
        },
      ],
    };

    const featurePrompt = {
      name: "feature",
      when: isManualMode,
      type: "checkbox",
      message: "Check feature needed for your project",
      choices: [],
    };
    return { presetPrompt, featurePrompt };
  }
}

module.exports = Creator;
