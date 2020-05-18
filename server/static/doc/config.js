require("../build/build.js");
var resolve = require("./resolve");
global.ENV = "dev"
rap.build(localRequire("@/server/static/doc", true), {
  js: {
    group: { "base": { src:"./base.js" } },
    input:resolve.input,
    output:resolve.output,
    browser:resolve.browser,
  },
  file:{
    input:resolve.input,
    output:resolve.output,
    browser:resolve.browser,
  },
  html:{
    input:resolve.input,
    output:resolve.output,
    browser:resolve.browser,
  },
  css:{
      group:{
        "base": { src:"./base.css" } 
      },
      input:resolve.input,
      output:resolve.output,
      browser:resolve.browser,
  },
  watchDirs:[localRequire("@/server/static",true)]
});
