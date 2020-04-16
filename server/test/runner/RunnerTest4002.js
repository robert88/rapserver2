/*
*
* @title：rap框架
* 用于构建通用的web程序
* @author：尹明
* */

const Runner = localRequire("@/server/bootstrap/Runner.js");

let run = new Runner({port:4002});

module.exports = run;
