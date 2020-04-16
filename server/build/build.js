require("./lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

localRequire("@/server/build/compiler/rap.parse.js");


const wake = rap.system.input;

//默认配置


//入口文件为打包文件必须是全路径
rap.build = function(entryPath, config) {

  config = config || {};

  entryPath = entryPath.toURI();

  var relativeWatch = {} //依赖收集

  if (wake.isFileSync(entryPath)) {
    hanlderHtml(entryPath, relativeWatch, config);
  } else {
    var htmlArr = wake.findFileSync(entryPath, "html", true);

    //过滤掉template目录下的文件
    htmlArr = htmlArr.filter(file => toPath(file).indexOf("/template/") == -1);

    htmlArr.forEach(function(file) {
      hanlderHtml(file, relativeWatch, config);
    });
  }

  //开发环境需要监听文件变化，实时更新
  if (global.ENV == "dev") {
    config.watchDirs = config.watchDirs || [localRequire("/@/server/static")];
    config.watchDirs.forEach(item => {
      rap.watch(item.toURI(), function(changeFiles) {
        handleChange(changeFiles)
      });
    })
  }

};

//从change文件是否命中相关文件
function handleChange(changeFiles, relativeWatch, config) {
  var handleChangeFile = {};
  changeFiles.forEach(function(file) {
    file = file.toURI();
    if (wake.existSync(file) && wake.isFileSync(file)) {
      for (var relativeFile in relativeWatch) {
        relativeFile = relativeFile.toURI();
        if (relativeWatch[relativeFile][file]) {
          handleChangeFile[relativeFile] = file;
        }
      }
    }
  })

  //已命中的文件进行更新
  for (var relativeFile in handleChangeFile) {
    console.log("----".bgYellow + "change file:".green, handleChangeFile[relativeFile]);
    console.log("----".bgYellow + "triggle pack:".yellow, relativeFile, config.lang);
    hanlderHtml(relativeFile, relativeWatch, config);
  }
}

/*处理html*/
function hanlderHtml(relativeFile, relativeWatch, config) {

  relativeFile = relativeFile.toURI();

  //过滤文件
  if (typeof config.filter == "function") {
    if (config.filter(relativeFile) === false) {
      return;
    }
  }

  var orgHTML = rap.parse.byHtmlFile(relativeFile, config, config.data, relativeWatch, {});

  orgHTML = rap.parse.sortCss(relativeFile, config, config.data, relativeWatch, {});

  orgHTML = rap.parse.sortJs(relativeFile, config, config.data, relativeWatch, {});
  
  if (global.ENV == "product") {

    orgHTML = rap.parse.MergeCss(relativeFile, config, config.data, relativeWatch, {});

    orgHTML = rap.parse.MergeJs(relativeFile, config, config.data, relativeWatch, {});
  }

}