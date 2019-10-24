// CLI 服务
// CLI 服务 (@vue/cli-service) 是一个开发环境依赖。它是一个 npm 包，局部安装在每个 @vue/cli 创建的项目中。

// CLI 服务是构建于 webpack 和 webpack-dev-server 之上的。它包含了：

// 加载其它 CLI 插件的核心服务；
// 一个针对绝大部分应用优化过的内部的 webpack 配置；
// 项目内部的 vue-cli-service 命令，提供 serve、build 和 inspect 命令。
// 如果你熟悉 create-react-app 的话，@vue/cli-service 实际上大致等价于 react-scripts，尽管功能集合不一样。

// CLI 服务章节涵盖了它的具体用法。

// npm执行vue-cli-service会默认到.bin目录查找执行的脚本,这里将/node_modules/.bin/vue-cli-service.cmd写成了js方式方便调试

//npm run serve
// # OR
// yarn serve

//package.json
// {
//     "scripts": {
//       "serve": "vue-cli-service serve",
//       "build": "vue-cli-service build"
//     }
//   }

// 用法：vue-cli-service serve [options] [entry]

// 选项：

//   --open    在服务器启动时打开浏览器
//   --copy    在服务器启动时将 URL 复制到剪切版
//   --mode    指定环境模式 (默认值：development)
//   --host    指定 host (默认值：0.0.0.0)
//   --port    指定 port (默认值：8080)
//   --https   使用 https (默认值：false)

// 你也可以使用 vue.config.js 里的 devServer 字段配置开发服务器。

const pt = require("path")
const jestPath = pt.resolve("D:/yinming/code/rapserver2-master/client","./accout2/node_modules/@vue/cli-service/bin/vue-cli-service.js");
process.argv.push("serve");
process.env.VUE_CLI_CONTEXT = "d:\\yinming/code/rapserver2-master/client/accout2"
require(jestPath)


