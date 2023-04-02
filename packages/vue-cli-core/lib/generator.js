const ejs = require("ejs");
const { normalizeFile, writeFileTree } = require("./utils");
const { GeneratorApi } = require("./generatorApi");
class Generator {
  /**
   * @description:
   * @param {*} context 项目目录
   * @param {*} pkg  项目的package.json
   * @param {*} plugins 插件对象 [{id,apply,options}]
   * @return {*}
   */
  constructor(context, { pkg, plugins = [] }) {
    console.log("Generator-构造函数", context, pkg, plugins);
    this.context = context;
    this.plugins = plugins;
    this.pkg = pkg;
    this.files = {}; // 依赖的所有文件存在这里
    this.fileMiddleWares = []; // 生成文件的中间件，每个插件都会往中间件里插入中间件 中间件往this.files 写入有文件

    // 从所有依赖中筛选中所有插件
    this.allPluginIds = Object.keys(this.pkg.dependencies || {})
      .concat(this.pkg.devDependencies || {})
      .filter(isPlugin);

    const cliService = plugins.find(
      (plugin) => plugin.id === "@vue/cli-service"
    );
    // cliService 配置对象是预设配置preset 作为根配置
    this.rootOptions = cliService?.options || {};
  }

  /**
   * @description: 生成模板文件
   * @return {*}
   */
  async generator() {
    // 初始化插件 修改filedMiddleWares和pkg
    this.initPlugins();
    // 提取插件的配置文件
    this.extractConfigFiles();
    await this.resolveFiles();
    // 更新package.json 添加新的依赖/命令
    this.files["package.json"] = JSON.stringify(this.pkg, null, 2) + "\n";
    await writeFileTree(this.context, this.files);
  }
  /**
   * @description: 加载插件
   * @return {*}
   */
  async initPlugins() {
    const { rootOptions } = this;
    for (const plugin of this.plugins) {
      const { id, apply, options } = plugin;
      // 给每一个插件都添加一个生成器
      const generatorApi = new GeneratorApi({
        id,
        generator: this,
        rootOptions,
        options,
      });
      await apply(generatorApi, options, rootOptions);
    }
  }
  /**
   * @description: 提取插件的配置文件
   * @return {*}
   */
  extractConfigFiles() {}

  resolveFiles() {
    for (const middleware of this.fileMiddleWares) {
      middleware(this.files, ejs.render);
    }
    normalizeFile(this.files);
  }
}

module.exports = { Generator };
