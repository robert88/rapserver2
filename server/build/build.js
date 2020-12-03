require("../lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

localRequire("@/server/build/compiler/rap.parse.handleHtml.js");
localRequire("@/server/build/compiler/rap.parse.handleJs.js");
localRequire("@/server/build/compiler/rap.parse.handleCss.js");
localRequire("@/server/build/compiler/rap.parse.handleFile.js");
localRequire("@/server/build/compiler/rap.parse.resolve.js");
localRequire("@/server/build/compiler/rap.parse.wrap.js");


const wake = rap.system.input;
const wakeout = rap.system.output;


/**
 * 入口文件为打包文件必须是全路径
 * 
 */

rap.build = function(entryPath, config) {

  config = config || {};

  entryPath = entryPath.toURI();

  var topWatch = {} //顶层依赖收集

  if (wake.isFileSync(entryPath)) {
    topWatch[entryPath] = {};
    hanlderHtml(entryPath, topWatch[entryPath], config);
  } else {
    var htmlArr = wake.findFileSync(entryPath, "html", true);

    //过滤掉template目录下的文件
    htmlArr = htmlArr.filter(file => file.toURI().indexOf("/template/") == -1);

    htmlArr.forEach(function(file) {
      file = file.toURI();
      topWatch[file] = {};
      hanlderHtml(file, topWatch[file], config);
    });
  }

  //开发环境需要监听文件变化，实时更新
  if (global.ENV == "dev") {
    config.watchDirs = config.watchDirs || [localRequire("@/server/static", true)];

    config.watchDirs.forEach(item => {
      if (!wake.existsSync(item)) {
        console.log("error:".error, "watch ", item, " not find");
        return;
      }
      rap.watch(item.toURI(), function(changeFiles) {
        handleChange(changeFiles, topWatch, config)
      });
    })
  }

};

/**
 * 
 * 
 * 处理html
 * 
 * 
 * */
function hanlderHtml(relativeFile, relativeWatch, config) {

  //将config带入css和js里面
  config.html = createConfig({ compression: rap.parse.compressionHtml }, config.html)

  relativeFile = relativeFile.toURI();

  var orgHTML = rap.parse.byHtmlFile(relativeFile, config.html, config.data, relativeWatch, {});

  handlerResource(orgHTML, relativeFile, relativeWatch, config, function(ret) {
    var outHtmlFile = config.html.output(relativeFile, relativeFile);
    if (global.ENV == "product") {
      //压缩html
      ret = config.html.compression(ret)

    }
    wakeout.writeSync(outHtmlFile, ret);
    console.log("----".warn + "pack file:".warn, outHtmlFile);
  });
}
/**
 * 
 * 合并config
 * 
 * */
function createConfig(defaultOption, option) {
  return Object.assign({ input: rap.parse.input, output: rap.parse.output, browser: rap.parse.browser }, defaultOption, option);
}

/**
 * 
 * 
 * 
 * 处理resource
 * 
 * */
function handlerResource(orgHTML, relativeFile, relativeWatch, config, callback) {

  var fileConfig = createConfig({ templatePath: relativeFile, fileAttrs: ["style", "href", "src"], nameReg: /\.(md|jpg|png|gif|ico|mp4|svg|mp3|txt|json|xml|ttf|eot|woff)/gi }, config.file);
  var jsConfig = createConfig({ fileConfig: fileConfig, templatePath: relativeFile }, config.js);
  var cssConfig = createConfig({ fileConfig: fileConfig, templatePath: relativeFile }, config.css);

  orgHTML = rap.parse.handleJs(orgHTML, jsConfig, relativeWatch, relativeFile); //解析js

  rap.parse.handleCSS(orgHTML, cssConfig, relativeWatch, relativeFile, html => { //解析css
    html = rap.parse.handleFile(html, fileConfig, relativeWatch); //解析file
    callback(html)
  });

}
/***
 * 
 * 从change文件是否命中相关文件
 * 
 * 
 * **/
function handleChange(changeFiles, relativeWatch, config) {
  console.clear();
  var handleChangeFile = {};
  var funcType = {};
  changeFiles.forEach(function(file) {
    file = file.toURI();
    for (var relativeFile in relativeWatch) {
      relativeFile = relativeFile.toURI();
      if (relativeWatch[relativeFile][file]) {
        //设置1，就要重新打包
        if (relativeWatch[relativeFile][file] == 1) {
          funcType[relativeFile] = 1
        }
        handleChangeFile[relativeFile] = handleChangeFile[relativeFile] || [];
        handleChangeFile[relativeFile].push(file)
      }
    }
  })

  //已命中的文件进行更新
  for (var relativeFile in handleChangeFile) {
    if (funcType[relativeFile]) {
      console.log(new Date().format("hh:mm:ss"), "----".warn + "change file:".green, handleChangeFile[relativeFile]);
      console.log(new Date().format("hh:mm:ss"), "----".warn + "triggle pack:".green, relativeFile, "width suffix:".warn, (config.html && config.html.data && config.html.data.suffix));
      relativeWatch[relativeFile] = {};
      hanlderHtml(relativeFile, relativeWatch[relativeFile], config);
    } else {
      var uni = {};
      handleChangeFile[relativeFile].forEach(item => {
        console.log(new Date().format("hh:mm:ss"), "build".warn, item, relativeFile)
        //必须是function
        relativeWatch[relativeFile][item]();
      })
    }

  }
}