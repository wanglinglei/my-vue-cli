module.exports = (file) => {
  file.injectFeature({
    name: "choose vue version/选择vue版本号",
    value: "vueVersion",
    description:
      "choose a version of Vue.js to start project with/选择vue的版本初始化项目",
    checked: true,
  });

  // 选项
  file.injectPrompt({
    name: "vueVersion",
    when: (answers) => {
      return answers.feature.includes("vueVersion");
    },
    message:
      "choose a version of Vue.js to start project with/选择vue的版本初始化项目",
    type: "list",
    choices: [
      {
        name: "2.x",
        value: "2",
      },
      {
        name: "3.x",
        value: "3",
      },
    ],
  });
  // 选择完毕的回调 根据选择插入对应插件配置
  file.onPromptComplete((answers, options) => {
    if (answers.vueVersion) {
      options.vueVersion = answers.vueVersion;
    }
  });
};
