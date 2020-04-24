require("../lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

localRequire("@/server/build/compiler/rap.parse.js");


const wake = rap.system.input;
const wakeout = rap.system.output;

//默认配置


//入口文件为打包文件必须是全路径
rap.build = function(entryPath, config) {

  config = config || {};

  entryPath = entryPath.toURI();

  var relativeWatch = {} //顶层依赖收集

  if (wake.isFileSync(entryPath)) {
    relativeWatch[entryPath] = {};
    hanlderHtml(entryPath, relativeWatch[entryPath], config);
  } else {
    var htmlArr = wake.findFileSync(entryPath, "html", true);

    //过滤掉template目录下的文件
    htmlArr = htmlArr.filter(file => file.toURI().indexOf("/template/") == -1);

    htmlArr.forEach(function(file) {
      file = file.toURI();
      relativeWatch[file] = {};
      hanlderHtml(file, relativeWatch[file], config);
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
        handleChange(changeFiles, relativeWatch, config)
      });
    })
  }

};

//从change文件是否命中相关文件
function handleChange(changeFiles, relativeWatch, config) {
  var handleChangeFile = {};
  var funcType = {};
  changeFiles.forEach(function(file) {
    file = file.toURI();
    for (var relativeFile in relativeWatch) {
      relativeFile = relativeFile.toURI();
      if (relativeWatch[relativeFile][file]) {
        //设置1，就要重新打包
        if(relativeWatch[relativeFile][file]==1){
          funcType[relativeFile] = 1
        }
        handleChangeFile[relativeFile] = handleChangeFile[relativeFile] || [];
        handleChangeFile[relativeFile].push(file)
      }
    }
  })

  //已命中的文件进行更新
  for (var relativeFile in handleChangeFile) {
    if(funcType[relativeFile] ){
      console.log("----".warn + "change file:".green, handleChangeFile[relativeFile]);
      console.log("----".warn + "triggle pack:".green, relativeFile, config.html.data.suffix.warn);
      relativeWatch[relativeFile]={};
      hanlderHtml(relativeFile, relativeWatch[relativeFile], config);
    }else{
      handleChangeFile[relativeFile].forEach(item=>{
        //必须是function
        relativeWatch[relativeFile][item]();
      })
    }

  }
}

/*处理html*/
function hanlderHtml(relativeFile, relativeWatch, config) {
  //将config带入css和js里面
  config.html = config.html || {}
  config.html.output = config.html.output || rap.parse.output;
  config.html.compression = config.html.compression || rap.parse.compressionHtml;
  relativeFile = relativeFile.toURI();
  //过滤文件
  if (typeof config.html.filter == "function") {
    if (config.html.filter(relativeFile) === false) {
      return;
    }
  }

  var orgHTML = rap.parse.byHtmlFile(relativeFile, config.html, config.data, relativeWatch, {});
handlerResource(orgHTML, relativeFile,relativeWatch, config, function(ret) {
    var outHtmlFile = config.html.output(relativeFile, relativeFile);
    if(global.ENV=="product"){
      //压缩html
      ret =  config.html.compression(ret)

    }
    wakeout.writeSync(outHtmlFile, ret);
    console.log("----".warn + "pack file:".warn, outHtmlFile);
  });
}

/*处理resource*/
function handlerResource(orgHTML, relativeFile,relativeWatch, config, callback) {
  var fileConfig = Object.assign({ templatePath: relativeFile }, config.file)
  var jsConfig = Object.assign({ fileConfig: fileConfig, templatePath: relativeFile }, config.js)
  var cssConfig = Object.assign({ fileConfig: fileConfig, templatePath: relativeFile }, config.css)

  rap.parse.handleJs(orgHTML, jsConfig,relativeWatch).then(ret => {
      return rap.parse.handleCSS(ret, cssConfig,relativeWatch)
    })
    .then(ret => {
      return rap.parse.handleFile(ret, fileConfig,relativeWatch);
    }).then(ret => {
      callback(ret);
    })

}