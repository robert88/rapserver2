const wake = rap.system.input;
const wakeout = rap.system.output;
const { clearNoteTag, parseTag } = require("./parse");
const parseTeample = require("./template");
const pt = require("path");
const URL = require("url");


var UglifyJS = require("uglify-js");
const babel = require("@babel/core");
var less = require('less');




rap.parse = rap.parse || {}

function byTag(tag, orgHtml, config, parentData, relativeWatch, unique) {

  orgHtml = clearNoteTag(tag, orgHtml);

  var tags = parseTag(tag, orgHtml);

  tags.forEach(function(tagInfo) {

    //路径必须在config里面配置
    var src = config.input(parentData.__templateFile__||"", tagInfo.attrs.src||"");

    //文件必须存在D:\yinming\code\rapserver2-master\server\test\compiler
    if (!src || !wake.existsSync(src)) {
      console.log(("parse tag:" + tag + " in " + parentData.__templateFile__ + " not find file by src:").error, src);
      orgHtml = orgHtml.replace(tagInfo.template, "<!--error:not find file-->");
      return;
    }

    //这个路径已经解析过了，存在循环解析
    if (unique[src]) {
      console.log(("parse tag:" + tag + " in " + parentData.__templateFile__ + " circle！！！by src:").error, src);
      orgHtml = orgHtml.replace(tagInfo.template, "<!--error:circle include-->");
      return;
    }
    unique[src] = true;

    //指定moduleSpace
    var moduleSpace = tagInfo.attrs.moduleSpace;
    var parseData;
    if (moduleSpace) {
      var result = "with(obj){ try{ var t =" + moduleSpace + ";}catch(e){console.log('error:'.error,'moduleSpace',e)} return t;}"
      var fn = new Function("obj", result);
      var setModuleSpace = fn(parentData);
      parseData = rap.extend("deepNotArray", {}, parentData, setModuleSpace);
    } else {
      parseData = parentData;
    }
    var htmlFromTag = rap.parse.byHtmlFile(src, config, parseData, relativeWatch, unique);

    //跳出了下级,这样同一级可以引用两次
    unique[src] = false;

    //插槽的位置
    var slotName = tagInfo.attrs.slot;

    //使用去掉模板标签
    var slotHtml = tagInfo.innerHTML;

    htmlFromTag = clearNoteTag("slot", htmlFromTag);

    var slotsTag = parseTag("slot", htmlFromTag);


    //定义了插槽，而且定义了填充的位置

    if (slotName) {
      var findReplace = false;
      slotsTag && slotsTag.forEach(function(tag) {
        if (slotName == tag.attrs.name) {
          htmlFromTag = htmlFromTag.replace(tag.template, slotHtml);
          findReplace = true;
        }
      });

      if (!findReplace) {
        htmlFromTag = htmlFromTag + slotHtml;
        console.log("warning:".warn, parseData.__templateFile__, ("-> slot (" + slotName + ") not find:").warn, " in ", src);
      }
    }

    orgHtml = orgHtml.replace(tagInfo.template, htmlFromTag);

  });

  return orgHtml;
}

/*
解析useSlot 标签
*/
rap.parse.useSlot = function(orgHtml, config, parentData, relativeWatch, unique) {
  return byTag("useSlot", orgHtml, config, parentData, relativeWatch, unique)
}
/*
解析include 标签
*/
rap.parse.byInclude = function(orgHtml, config, parentData, relativeWatch, unique) {
  return byTag("include", orgHtml, config, parentData, relativeWatch, unique)
}

/*
通过html代码来解析
*/
rap.parse.byHtml = function(orgHtml, config, parseData, relativeWatch, unique) {

  orgHtml = parseTeample(orgHtml, parseData);

  //还原

  //编译出问题了
  if (!orgHtml || orgHtml.indexOf("with(obj)") == 0) {
    console.error(parseData.__templateFile__, ":has error!!!!");
    return orgHtml;
  }

  //解析useSlot 标签
  orgHtml = rap.parse.useSlot(orgHtml, config, parseData, relativeWatch, unique);

  //解析include 标签
  orgHtml = rap.parse.byInclude(orgHtml, config, parseData, relativeWatch, unique);

  return orgHtml;
}


//通过html文件来解析
rap.parse.byHtmlFile = function(entryFile, config, parentData, parentRelativeWatch, unique) {

  unique = unique || {};
  config.data = config.data||{}
  parentData = parentData||{}
  parentData.suffix = parentData.suffix ||"cn";
  if(!config.data.suffix){
    config.data.suffix = parentData.suffix;
    rap.parse.outputName = rap.parse.outputName || parentData.suffix;
  }
  var suffix = parentData.suffix;

  config.input = config.input || inputResolve;

  //获取文件的模板
  var noSuffixFile = entryFile.replace("." + suffix + ".html", ".html"); //没有后缀的html文件
  entryFile = noSuffixFile.replace(".html", "." + suffix + ".html");

  var orgHtml, __templateFile__;
  if (wake.existsSync(entryFile)&&wake.isFileSync(entryFile)) {
    orgHtml = wake.readDataSync(entryFile);
    __templateFile__ = entryFile;
  } else if (wake.existsSync(noSuffixFile)&&wake.isFileSync(noSuffixFile)) {
    orgHtml = wake.readDataSync(noSuffixFile);
    __templateFile__ = noSuffixFile;
  } else {
    console.log("error:".error, "not find entry file", entryFile, " and ", noSuffixFile)
    return "";
  }

  //收集当前模板文件的依赖
  let mapFileName = entryFile.toURI(); //统一路径格式
  parentRelativeWatch[mapFileName] = 1;
  parentRelativeWatch[noSuffixFile.toURI()] = 1; //同时添加两个监听，删除和添加也可以被监听到
  parentRelativeWatch[entryFile.toURI()] = 1;

  //获取数据文件的数据
  var dataFile = noSuffixFile.replace(".html", "." + suffix + ".js");
  var localData;
  if (wake.existsSync(dataFile)) {
    delete require.cache[require.resolve(dataFile)]; //清除缓存
    try {
      var localData = require(dataFile);
    } catch (error) {
      console.log("require error".error, dataFile, error);
      localData = {};
    }
    localData.__dataFile__ = dataFile; //用于跟踪数据

  } else {
    localData = {};
  }

  if(localData.__relativeWatch__){
    Object.assign(parentRelativeWatch,localData.__relativeWatch__)
  }

  parentRelativeWatch[dataFile.toURI()]= 1; //数据文件依赖,可以通过__relativeWatch__来添加数据依赖

  var parseData = rap.extend("deepNotArray", {}, localData, parentData); //深度拷贝，但是对于数组不需要深度拷贝

  parseData.__parentTemplateFile__ = parentData&&parentData.__templateFile__; //用于跟踪模板
  parseData.__templateFile__ = __templateFile__; //用于跟踪模板

  orgHtml = rap.parse.byHtml(orgHtml, config, parseData, parentRelativeWatch, unique);

  return orgHtml;

}

/**
 * 清除注释的干扰/<!--((?!<!--).)*?-->/gmi
 * */
async function clearNoteWrap(orgHtml, wrap) {
  //过滤掉注释
  var noteReg = /<!--[\u0000-\uFFFF]*?-->/gmi;
  var noteRegReplaceString = "______RAPREPLACENOTETAG______"
  var noteRegArr = [];
  orgHtml = orgHtml.replace(noteReg, function(val) {
    noteRegArr.push(val);
    return noteRegReplaceString + (noteRegArr.length - 1)
  });

  orgHtml = await wrap(orgHtml);

  noteRegArr.forEach(function(str, idx) {
    orgHtml = orgHtml.replace(new RegExp(noteRegReplaceString + idx), str);
  });

  return orgHtml;
}

/**
 * 清除干扰
 * */
rap.parse.wrap=function(reg,id,orgHtml, wrap) {
  var arr = [];
  orgHtml = orgHtml.replace(reg, function(val) {
    arr.push(val);
    return id + (arr.length - 1)
  });

  orgHtml =  wrap(orgHtml);

  arr.forEach(function(str, idx) {
    orgHtml = orgHtml.replace(new RegExp(id + idx), str);
  });

  return orgHtml;
}
/**
 * 拷贝文件，并且得到浏览路径
 * */
function copyFile(m1,config){
  var src = m1.split("?")[0]
  var param = m1.split("?")[1]
  var outpath = config.output(config.templatePath,src);
  var inpath = config.input(config.templatePath,src);
  var browserPath = config.browser(src);
  var extname = pt.extname(m1);
  config.nameReg.lastIndex=0;
  if(config.nameReg.test(extname)){
    if (wake.existsSync(inpath)) {
      wakeout.copySync(inpath, outpath);
      param = param&&param.replace(/ver=\d+/,wake.getModifySync(inpath));
    }
    return browserPath+(param?("?"+param):"")
  }else{
    return m1;
  }
}
/**
 * 解析url()文件
 * */
function parseFileByCssCode(code,config){
  return code.replace(/url\(([^\)]+)\)/gi, function(m, m1) {
    var browserPath = copyFile(m1,config);
    return "url(" + browserPath + ")";
  })
}
function mergeFileConfig(config){
  config.fileAttrs = config.fileAttrs || ["style","href","src"];
  config.output = config.output || outputResolve
  config.input = config.input || inputResolve
  config.browser = config.browser || browserResolve
  config.nameReg = config.nameReg || /\.(md|jpg|png|gif|ico|mp4|svg|mp3|txt|json|xml|ttf|eot|woff)/gi
 
}
/**
 * 解析file
 * */
rap.parse.handleFile = async function(orgHtml, config) {

  mergeFileConfig(config);

 if(!config.templatePath){
    console.log("error:".error,"please set file config templatePath");
    return;
  }
  return await clearNoteWrap(orgHtml, function(html) {

    //解析css中的图片
    var styleTags = parseTag("style", html);

    styleTags.forEach(item => {
      html= html.replace(item.template, parseFileByCssCode(item.template,config));
    });

    //解析标签中的图片

    config.fileAttrs.forEach(item => {

      html = html.replace(new RegExp(item+"\s*=\s*(\")([\\u0000-\\uFFFF]*?[^\\\\])\"|"+item+"\\s*=\\s*(')([\\u0000-\\uFFFF]*?[^\\\\])\'","igm"),function(m,quot,m1){
       if(!m1){
       //后面的括号匹配不到
        var reReg = new RegExp(item+"\\s*=\\s*(')([\\u0000-\\uFFFF]*?[^\\\\])\'","igm").exec(m);
        quot = reReg[1]
        m1 = reReg[2]
       }
        if(item=="style"){
         m1= m1.replace(item.template, parseFileByCssCode(m1,config));
        }else{
          var browserPath =copyFile(m1,config);
          ret = browserPath;
        }
        return item+"="+quot+ret+quot;
      })
    })



    return html;
  });
}
/**
 * 解析js
 * */
rap.parse.handleJs = async function(orgHtml, config) {

mergeFileConfig(config.fileConfig);

  return await clearNoteWrap(orgHtml, async function(html) {

    mergeDefaultConfig(config, async function(code) {
      var babelT = babel.transformSync(code, {
        "presets": [
          "@babel/preset-env"
        ]
      })
      //上线打包
      if(global.ENV=="product"){
        return rap.parse.compressionJs(babelT.code);
      }else{
        return babelT.code.replace(/^\s*\"use\sstrict\";\s+/, "")
      }
    }, "body")

    var tags = parseTag("script", html);

    tags = tags.filter(item => {
      var type = item.attrs.type;
      var src = item.attrs.src;
      if (type && (type != "text/javascript" || type != "text/ecmascript" || type != "application/ecmascript" || type != "application/javascript" || type != "text/vbscript")) {
        return false;
      } else {
        if (src) {
          item.codeType = "file";
        } else {
          item.codeType = "code";
          item.attrs.sort = (item.attrs.sort == "true") ? true : "false"; //默认不用排序
        }
        return true;
      }
    })

    return await compilerSource(html, tags, config, "js");
  })

}

/**
 * 解析css,默认使用less编译
 * */
rap.parse.handleCSS = async function(orgHtml, config) {

mergeFileConfig(config.fileConfig);

  return await clearNoteWrap(orgHtml, async function(html) {

    //需要将less文件转css文件
    mergeDefaultConfig(config, async function(code, callback) {
        var output = await less.render(code);
        if(global.ENV=="product"){
          return rap.parse.compressionCss(output.css);
        }
        return output.css
      }, "head",
      function(resolvePath) {
        return browserResolve(resolvePath, "css");
      },
      function(templatePath, resolvePath) {
        return outputResolve(templatePath, resolvePath, "css");
      })

    var tags = parseTag("link", html, "single");

    tags = tags.filter(item => {
      var rel = item.attrs.rel;
      item.codeType = "file";
      if (rel == "stylesheet") {
        return true;
      }
    })

    var styleTags = parseTag("style", html);

    styleTags.forEach(item => {
      item.codeType = "code";
      item.attrs.sort = (item.attrs.sort == "true") ? true : "false"; //默认不用排序

    });

    var sourceTags = tags.concat(styleTags).sort(function(a, b) {
      return a.mapIndex > b.mapIndex ? 1 : -1;
    })

    return await compilerSource(html, sourceTags, config, "css");
  })
}

/*
源路径转源路径的物理路径
*/
var root = __dirname.toURI().replace("/server/build/compiler", "");

function inputResolve(templatePath, resolvePath) {
  if(!resolvePath){
    return "";
  }
  if(!templatePath){
    return resolvePath
  }
  if (resolvePath.trim().toURI().indexOf("/") == 0) {
    return root + resolvePath.trim().toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    return resolvePath;
  } else {
    return pt.resolve(pt.dirname(templatePath), resolvePath);
  }
}
rap.parse.input = inputResolve;
/*
源路径转目标路径的物理路径
*/
function outputResolve(templatePath, resolvePath, type) {
  resolvePath =  resolvePath&&resolvePath.trim().toURI()||"";
  if(!resolvePath){
    return "";
  }
  if(!templatePath){
    return resolvePath
  }
  var dirNameSpace = rap.parse.outputName||"dist";
  if (type) {
    resolvePath = resolvePath.replace(/\.\w+$/, "." + type);
  }
  if (resolvePath.indexOf("/") == 0) {
    return (root + `/${dirNameSpace}/` + resolvePath.trim()).toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    if(~resolvePath.indexOf(root)){
      return (root + `/${dirNameSpace}/` + resolvePath.replace(root,"")).toURI();
    }else{
      return resolvePath;
    }
  } else {
    return pt.resolve(pt.dirname(templatePath), resolvePath).toURI().replace(root, root + `/${dirNameSpace}/`);
  }
}
rap.parse.output = outputResolve;
/*
源路径转浏览器地址,可以指定后缀名
*/
function browserResolve(resolvePath, type) {
  if(!resolvePath){
    return "";
  }
  var dirNameSpace = rap.parse.outputName||"dist";
  if (type) {
    resolvePath = resolvePath.replace(/\.\w+$/, "." + type);
  }
  if (resolvePath.trim().toURI().indexOf("/") == 0) {
    return (`/${dirNameSpace}/` + resolvePath.trim()).toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    return resolvePath;
  } else {
    return resolvePath;
  }
}
rap.parse.browser = browserResolve;
/**
 * 配置信息
 * */
function mergeDefaultConfig(config, build, location, brResolve, opResolve) {

  config.input = config.input || inputResolve;
  config.output = config.output || opResolve || outputResolve;
  config.browser = config.browser || brResolve || browserResolve;

 config.build =config.build || build;
 config.location =config.location || location;

}
/**
 * 提取资源文件
 * */
async function compilerSource(html, tags, config, type) {


  var tagMap = {};
  var groupMap = {};
  var codeStack = []; //标签内部的代码


  //清除html中的script标签，得到script标签的信息
  tags.forEach(function(tag, idx) {
    var url = tag.attrs.src || tag.attrs.href;
    var src;
    var param;
    var sort = tag.attrs.sort;
    var group = tag.attrs.group;
    var id = tag.attrs.id;
    var clear = true;
    var uuid = "__RAP" + tag.startTag.replace(/\W+/g, "").toUpperCase() + (id || idx) + "SORT__";

    var replaceUuid = "__RAP" + idx + "REPLACE__";

    if (tag.codeType == "file") {
      src = url.split("?")[0].trim().toURI();
      param = URL.parse(url).query;
      uuid = src;
    }

    //需要合并打包的必须清除
    if (group) {
      clear = true;
    } else if (sort === "false") { //固定位置，且没有设置打包对象
      clear = false;
    }

    //用于还原位置
    if (clear) {
      html = html.replace(tag.template, "");
    } else {
      html = html.replace(tag.template, replaceUuid);
      tag.replaceUuid = replaceUuid;
    }

    //重复的代码需要清除掉
    if (tagMap[uuid]) {
      if (!clear) {
        console.log("warning:".warn, src, " repeat but not clear");
      }
      if (group) {
        console.log("warning:".warn, src, " repeat in group:", group)
      }
      return;
    }

    if (group) {
      groupMap[group] = groupMap[group] || [];
      groupMap[group].push(uuid);
    } else {
      codeStack.push(uuid);
    }

    tagMap[uuid] = {
      src: src,
      param: param,
      clear: clear,
      replaceUuid: replaceUuid,
      code: tag.innerHTML,
      codeType: tag.codeType
    };

  });

  //处理合并
  for (var name in groupMap) {
    html = await hanlderGroupMap(name, groupMap, config, html, tagMap, type);
  }

  for (var uuidIndex in codeStack) {
    html = await insetCode(html, tagMap[codeStack[uuidIndex]], null, config, type);
  }

  //还原
  tags.forEach(function(tag, idx) {
    if (tag.replaceUuid) {
      html = html.replace(tag.replaceUuid, tag.template);
    }
  })
  codeStack = null;
  tagMap = null;
  groupMap = null;
  return html;
}

/**
 *处理合并
 * */
async function hanlderGroupMap(name, groupMap, config, html, tagMap, type) {
  var item = groupMap[name]
  if (!config.group || !config.group[name] || !config.group[name].src) {
    console.log("error".error, type+" config  -> group['" + name + "'].src not set");
    return;
  }

  var groupTag =config.group[name];

  var groupCode = [];
  item.forEach(uuid => {
    var tag = tagMap[uuid];
    if (tag.codeType == "file") {
      var realFile =config.input(config.templatePath, tag.src);
      if (wake.existsSync(realFile)) {
        groupCode.push(wake.readDataSync(realFile));
      } else {
        console.log("error:".error, "group merge not find :", realFile);
      }
    } else if (tag.codeType == "code") {
      groupCode.push(tag.code);
    }
  })

  groupTag.codeType = "file";
  groupTag.location = groupTag.location ||config.location

  return await insetCode(html, groupTag, groupCode.join("\n;\n"), config, type);
}

/**
 * 解析html引入资源，和解析编译code
 * */
async function insetCode(html, item, code, config, type) {

  code = code || item.code;

  var param = URL.format(item.param || {});
  var src = item.src;
  var template;
  var location = item.location||config.location;
  if (item.codeType == "file") {
    var realFile =config.input(config.templatePath, src); //源文件
    var realWriteFile =config.output(config.templatePath, src); //目标文件
    if (!code) {
      if (!wake.existsSync(realFile)) {
        console.log("error:".error, "insertScript not find file:", src, "->".error, realFile);
        return html;
      }
      code = wake.readDataSync(realFile);
    }
    //目标文件不能覆盖源文件
    if (realFile == realWriteFile) {
      console.log("error:".error, "in file is out file", src, "->".error, realFile);
      return html;
    } else {
      var transformCode =  await config.build(code)
      if(type=="css"){//解析css文件路径
        transformCode = parseFileByCssCode(transformCode,config.fileConfig);
      }
      wakeout.writeSync(realWriteFile,transformCode);
    }
    if (type == "css") {
      template = "<link rel='stylesheet' src='" +config.browser(src) + (param ? ("?" + param) : "") + "'/>"
    } else {
      template = "<script src='" +config.browser(src) + (param ? ("?" + param) : "") + "'></script>"
    }
  } else {
    if (type == "css") {
      template = "<style>\n" + await config.build(code) + "\n</style>"
    } else {
      template = "<script>\n" + await config.build(code) + "\n</script>"
    }

  }

  //需要清除原来的位置
  if (!item.clear&&item.replaceUuid) {
    html = html.replace(item.replaceUuid, template);
  } else {
    if (item.replaceUuid) {
      html = html.replace(item.replaceUuid, "");
    }
    if (location && (~html.indexOf("</" + location + ">"))) {
      html = html.slice(0, html.lastIndexOf("</" + location + ">")) + template + "\n" + html.slice(html.lastIndexOf("</" + location + ">"), html.length)
    } else {

      //设置了location，但是找不到location的位置
      if (location) {
        console.log("warning:".warn, "html is not has </" + location + ">");
      }

      html = html + "\n" + template + "\n";
    }
  }

  return html;
}

//压缩html代码
rap.parse.compressionHtml = function(outHtmlFile){
  outHtmlFile = outHtmlFile.replace(/<!--[\u0000-\uFFFF]*?-->/gm,"");
  outHtmlFile =  rap.parse.wrap(/"[^\\]*?"/g,"___RAPcompressionQUOTONE__",outHtmlFile,function(wrapHtml1){
   return rap.parse.wrap(/'[^\\]*?'/g,"___RAPcompressionQUOTTWO__",wrapHtml1,function(wrapHtml2){
      return rap.parse.wrap(/(<pre[^>]*>)([\\u0000-\\uFFFF]*?)<\/pre>/igm,"___RAPcompressionPREAll__",wrapHtml2,function(wrapHtml3){
        return rap.parse.wrap(/(<script[^>]*>)([\\u0000-\\uFFFF]*?)<\/script>/igm,"___RAPcompressionPRESCRIPT__",wrapHtml3,function(wrapHtml4){
          return rap.parse.wrap(/(<style[^>]*>)([\\u0000-\\uFFFF]*?)<\/style>/igm,"___RAPcompressionSTYLE__",wrapHtml4,function(wrapHtml5){
            return wrapHtml5.replace(/\s+/igm," ");
           })
         })
      })
    })
  })
  return outHtmlFile;
}
//压缩css代码
rap.parse.compressionCss = function(code){
  code = code.replace(/<\/\*[\u0000-\uFFFF]*?\*\//gm,"");
  code =  rap.parse.wrap(/"[^\\]*?"/g,"___RAPcompressionQUOTONE__",code,function(wrapHtml1){
    return rap.parse.wrap(/'[^\\]*?'/g,"___RAPQUOTTWO__",wrapHtml1,function(wrapHtml2){
       return rap.parse.wrap(/(<pre[^>]*>)([\\u0000-\\uFFFF]*?)<\/pre>/igm,"___RAPcompressionPREAll__",wrapHtml2,function(wrapHtml3){
        return wrapHtml3.replace(/\s+/igm," ");
       })
     })
   })
  return code;
}

//压缩js代码
rap.parse.compressionJs = function(code,options){
   options =Object.assign({},options);
  var result = UglifyJS.minify(code, options);
  return result.code;
}

/*
    ### 解析模板文件

    模板就是代码片段分割在不同的html，方便管理和复用html代码结构

    依赖rap如下模板

    1、rap.system

        提供文件的读写
    
    2、rap.extend

        提供JavaScript对象的复制方式，如排除数组的深度拷贝

    提供如下api

    ###### rap.parse.byHtmlFile

        (entryFile, config, parentData, parentRelativeWatch, unique)

        entryFile：为模板html文件，一般是存在的[后缀文件](#suffix)，如果没有后缀文件那就是去掉后缀文件

        config：
        ```
        {
            suffix:"cn",//模板文件和数据文件的后缀文件,
            resolve:function //将模板里面使用到的路径转为实际物理地址
        }
        ```
        parentData ： 入口数据，可以在调用的地方加入数据，这个数据会深度合并数据文件的数据

        parentRelativeWatch：监听文件物理地址列表，当前编译的文件列表下收集所有依赖，树形结构

        unique：防止递归循环解析

    ###### rap.parse.byHtml

    解析对象为html代码

#### 后缀文件

    如参数的后缀为cn,那么html文件为xxx.cn.html,数据文件为xxx.cn.js
*/