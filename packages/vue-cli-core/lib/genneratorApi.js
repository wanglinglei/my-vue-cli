const {
  extractCallDir,
  isString,
  toShortPluginId,
  isObject,
} = require("./utils");
const globby = require("./globby");
const { mergeDeps } = require("vue-cli-utils");
class GeneratorApi {
  /**
   * @description: 生成器
   * @param {*} id  插件id
   * @param {*} generator 生成器
   * @param {*} options 插件配置
   * @param {*} rootOptions 根配置
   * @return {*}
   */
  constructor(options = {}) {
    const { id, generator, options, rootOptions } = options;
    console.log("GeneratorApi-构造函数", id, generator, options, rootOptions);
    this.id = id;
    this.generator = generator;
    this.options = options;
    this.rootOptions = rootOptions;
    this.pluginsData = generator.plugins
      .filter((id) => id !== "@vue/cli-service")
      .map((id) => ({ name: toShortPluginId(id) }));
  }
  /**
   * @description: 渲染模板文件
   * @param {*} source 模板文件路径
   * @param {*} addtionalData 附加数据对象
   * @return {*}
   */
  render(source, addtionalData) {
    // 获取到模板文件的绝对路径
    // D:\github项目\vue-cli\hello\node_modules\@vue\cli-service\generator
    const baseDir = extractCallDir();
    if (isString(source)) {
      // D:\github项目\vue-cli\hello\node_modules\@vue\cli-service\generator\template
      source = path.resolve(baseDir, source);
      //暂存中间件函数 并没有执行
      this._injectFileMiddleware(async (files) => {
        const data = this._resolveData(addtionalData);
        let _files = await globby(["**/*"], { cwd: true });

        for (const file of _files) {
          const targetPath = rawPath
            .split("/")
            .map((filed) => {
              if (filed.charAt(0) === "_") {
                // 处理一些特殊文件 _gitignore => .gitignore
                return `.${filed.slice(1)}`;
              }
              return filed;
            })
            .join("/");
          // 模板文件夹里模板文件的绝对路径
          const sourcePath = path.resolve(source, rawPath);
          const content = renderFile(sourcePath, data);
          files[targetPath] = content;
        }
      });
    }
  }

  _resolveData(addtionalData) {
    return Object.assign(
      {
        options: this.options, // 插件配置
        rootOptions: this.rootOptions, // 根配置
        plugins: this.pluginsData, // 所有插件
      },
      addtionalData
    );
  }
  _injectFileMiddleware(middleware) {
    this.generator.fileMiddleWares.push(middleware);
  }
  /**
   * @description: 扩展对应插件的package
   * @return {*}
   */
  extendPackage(fileds) {
    const pkg = this.generator.pkg;
    const toMerge = fileds;
    for (const key in toMerge) {
      const value = toMerge[key];
      const existing = pkg[key];
      if (
        isObject(value) &&
        (key === "dependencies" || key === "devDependencies")
      ) {
        pkg[key] = mergeDeps(existing || {}, value);
      } else {
        pkg[key] = value;
      }
    }
  }
}

module.exports = {
  GeneratorApi,
};
