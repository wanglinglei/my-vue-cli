const defaultPreset = {
  useConfigFiles: false, // 是否把babel eslint postcss 这些包对应的配置项放在单独的文件
  cssPreprocessor: undefined, // 默认没有配置css 预处理器
  plugins: {
    "@vue/cli-plugin-babel": {}, //babel 插件
    "@vue/cli-plugin-eslint": {
      //eslint
      config: "base",
      lintOn: ["save"], // 保存时进行lint 检查
    },
  },
};
const defaults = {
  default: Object.assign({ vueVersion: "2" }, defaultPreset),
  _default_vue3: Object.assign({ vueVersion: "3" }, defaultPreset),
};

module.exports = defaults;
