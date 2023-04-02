#! /usr/bin/env node

const program = require("commander");
// const { create } = require("../lib/create.js");
program
  .version(`vue-cli 0.0.0`) // 指定版本号
  .usage("<command> [options]"); // 指定使用方式命令 参数

program
  .command("create <app-name>") // 添加一个create命令 <必选参数>
  .description("create a new project by vue-cli")
  .action((appName) => {
    // get app name
    require("../lib/create")(appName);
  });

program.parse(process.argv);
