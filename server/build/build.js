

require("./lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");


const wake = rap.systems;

//默认配置
rap.buildConfig = { watchDirs: [localRequire("/@/server/static")] }

//入口文件为打包文件必须是全路径
rap.build = function (entryPath, options) {

  options = Object.assign({}, rap.buildConfig, {});

  entryPath = entryPath.toURI();

  var relativeFileMap = {}//依赖收集
  if (wake.isFile(entryPath)) {
    hanlderHtml(entryPath, relativeFileMap, options);
  } else {
    var htmlArr = wake.findFile(entryPath, "html", true);

    //过滤掉template目录下的文件
    htmlArr = htmlArr.filter(file => toPath(file).indexOf("/template/") == -1);

    htmlArr.forEach(function (file) {
      file = file.toURI();
      hanlderHtml(file, relativeFileMap, options);
    });
  }

  //监听文件变化
  options.watchDirs.forEach(item => {
    rap.watch(item.toURI(), function (changeFiles) {
      handleChange(changeFiles)
    });
  })

};

//从change文件是否命中相关文件
function handleChange(changeFiles, relativeFileMap, options) {
  var handleChangeFile = {};
  changeFiles.forEach(function (file) {
    file = file.toURI();
    if (wake.isExist(file) && wake.isFile(file)) {
      for (var relativeFile in relativeFileMap) {
        relativeFile = relativeFile.toURI();
        if (relativeFileMap[relativeFile][file]) {
          handleChangeFile[relativeFile] = file;
        }
      }
    }
  })

  //已命中的文件进行更新
  for (var relativeFile in handleChangeFile) {
    console.log("----".bgYellow + "change file:".green, handleChangeFile[relativeFile]);
    console.log("----".bgYellow + "triggle pack:".yellow, relativeFile, options.lang);
    hanlderHtml(relativeFile.toURI(), relativeFileMap, options);
  }
}

