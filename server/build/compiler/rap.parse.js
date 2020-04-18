const wake = rap.system.input;
const wakeout = rap.system.output;
const { clearNoteTag, parseTag } = require("./parse");
const parseTeample = require("./template");
const pt = require("path");
const URL = require("url");



const babel = require("@babel/core");
var less = require('less');




rap.parse = rap.parse || {}

function byTag(tag, orgHtml, config, parentData, relativeWatch, unique) {

  orgHtml = clearNoteTag(tag, orgHtml);

  var tags = parseTag(tag, orgHtml);

  tags.forEach(function(tagInfo) {

    //路径必须在config里面配置
    var src = config.resolve(parentData.__templateFile__, tagInfo.attrs.src);

    //文件必须存在D:\yinming\code\rapserver2-master\server\test\compiler
    if (!src || !wake.existsSync(src)) {
      console.log(("parse tag:" + tag + " in " + parentData.__templateFile__ + " not find file by src:").error, src);
      orgHtml = orgHtml.replace(tagInfo.template, "<!--error:not find file-->");
      return;
    }

    //这个路径已经解析过了，存在循环解析
    if (unique[src] == 1) {
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

  var suffix = config.suffix || "cn";

  config.resolve = config.resolve || inputResolve;

  //获取文件的模板
  var noSuffixFile = entryFile.replace("." + suffix + ".html", ".html"); //没有后缀的html文件
  entryFile = noSuffixFile.replace(".html", "." + suffix + ".html");

  var orgHtml, __templateFile__;
  if (wake.existsSync(entryFile)) {
    orgHtml = wake.readDataSync(entryFile);
    __templateFile__ = entryFile;
  } else if (wake.existsSync(noSuffixFile)) {
    orgHtml = wake.readDataSync(noSuffixFile);
    __templateFile__ = noSuffixFile;
  } else {
    console.log("error:".error, "not find entry file", entryFile, " and ", noSuffixFile)
    return "";
  }

  //收集当前模板文件的依赖
  let mapFileName = entryFile.toURI(); //统一路径格式
  parentRelativeWatch[mapFileName] = {};
  parentRelativeWatch[mapFileName][noSuffixFile.toURI()] = 1; //同时添加两个监听，删除和添加也可以被监听到
  parentRelativeWatch[mapFileName][entryFile.toURI()] = 1;



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

    parentRelativeWatch[mapFileName][dataFile.toURI()] = localData.__relativeWatch__ || 1; //数据文件依赖,可以通过__relativeWatch__来添加数据依赖

  } else {
    localData = {};
  }

  var parseData = rap.extend("deepNotArray", {}, localData, parentData); //深度拷贝，但是对于数组不需要深度拷贝

  parseData.__parentTemplateFile__ = parentData.__templateFile__; //用于跟踪模板
  parseData.__templateFile__ = __templateFile__; //用于跟踪模板

  orgHtml = rap.parse.byHtml(orgHtml, config, parseData, parentRelativeWatch[mapFileName], unique);

  return orgHtml;

}

/**
 * 解析js
 * */
rap.parse.handleJs = function(html, config) {

  mergeDefaultConfig(config,function(code){
    var babelT = babel.transformSync(code,{
      "presets": [
        "@babel/preset-env"
      ]
    })
    return babelT.code
  },"body")

  var tags = parseTag("script", html);

  tags = tags.filter(item=>{
    var type = item.attrs.type;
    var src = item.attrs.src;
    if(type&&(type!="text/javascript"||type!="text/ecmascript"||type!="application/ecmascript"||type!="application/javascript"||type!="text/vbscript")){
      return false;
    }else{
      if(src){
        item.codeType="file";
      }else{
        item.codeType ="code";
      }
      return true;
    }
  })

  return compilerSource(html,tags,config);

}

/**
 * 解析css,默认使用less编译
 * */
rap.parse.handleCSS = function(html,config) {

  mergeDefaultConfig(config,function(code){
    var output = less.renderSync(code);
    return output.css;
  },"head")

  var tags = parseTag("link", html);

  tags = tags.filter(item=>{
    var rel = item.attrs.rel;
    item.codeType="file";
    item.sort = html.indexOf(item.template);
    if(rel=="stylesheet"){
      return true;
    }
  })

  var styleTags = parseTag("style", html);

  styleTags.every(item=>{
    item.codeType="code";
    item.sort = html.indexOf(item.template);
  });

  var sourceTags = tags.concat(styleTags).sort(function(a,b){
    return a.sort>b.sort?1:-1;
  })

  return  compilerSource(html,sourceTags,config);
}

/*
源路径转源路径的物理路径
*/
var root = __dirname.toURI().replace("/server/build/compiler", "");
function inputResolve(templatePath, resolvePath) {
  if (resolvePath.trim().toURI().indexOf("/") == 0) {
    return root + resolvePath.trim().toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    return resolvePath;
  } else {
    return pt.resolve(pt.dirname(templatePath), resolvePath);
  }
}
/*
源路径转目标路径的物理路径
*/
function outputResolve(templatePath, resolvePath) {
  if (resolvePath.trim().toURI().indexOf("/") == 0) {
    return root+"/dirt/" + resolvePath.trim().toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    return resolvePath;
  } else {
    return pt.resolve(pt.dirname(templatePath), resolvePath).toURI().replace(root,root+"/dirt/");
  }
}
/*
源路径转浏览器地址
*/
function browserResolve( resolvePath){
  if (resolvePath.trim().toURI().indexOf("/") == 0) {
    return "/dirt"+ resolvePath.trim().toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    return resolvePath;
  } else {
    return resolvePath;
  }
}
/**
 * 配置信息
 * */
function mergeDefaultConfig(config,build,location){

  config.resolve = config.resolve || {};
  config.code = config.code || {};

  config.resolve.input =  config.resolve.input || inputResolve;
  config.resolve.output =  config.resolve.output || outputResolve;
  config.resolve.browser =   config.resolve.browser || browserResolve;

  config.code.build = config.code.build || build;
  config.code.location = config.code.location || location;

}
/**
 * 提取资源文件
 * */
function compilerSource(html,tags,config){


  var tagMap = {};
  var groupMap = {};
  var codeStack = []; //标签内部的代码


  //清除html中的script标签，得到script标签的信息
  tags.forEach(function(tag, idx) {
    var url = tag.attrs.src||tag.attrs.href;
    var src;
    var param;
    var sort = tag.attrs.sort;
    var group = tag.attrs.group;
    var id = tag.attrs.id;
    var clear = true;
    var uuid = "__RAP"+tag.startTag.replace(/\W+/g,"").toUpperCase() + (id || idx) + "SORT__";

    if (tag.codeType=="file") {
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

    if (clear) {
      html = html.replace(tag.template, "");
    }

    //重复的代码需要清除掉
    if (tagMap[uuid]) {
      if(!clear){
        console.log("warning:".warn,src," repeat but not clear");
      }
      if(group){
        console.log("warning:".warn,src," repeat in group:",group)
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
      code: tag.innerHTML,
      codeType: tag.codeType
    };

  });

  //处理合并
  Object.keys(groupMap).forEach(name => {
    item = groupMap[name]
    if (!config.code.group || !config.code.group[name] || !config.code.group[name].src) {
      console.log("error".error, " config  -> code.group['" + name + "'].src not set");
      return;
    }

    var groupTag = config.code.group[name];

    var groupCode = [];
    item.forEach(uuid => {
      var tag = tagMap[uuid];
      if (tag.codeType == "file") {
        var realFile = config.resolve.input(config.code.templatePath,tag.src);
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
    groupTag.location = groupTag.location || config.code.location

    html = insetScript(html, groupTag, groupCode.join("\n\n"), config);

  })

  codeStack.forEach(uuid => {
    html = insetScript(html, tagMap[uuid], null, config);
  })

  codeStack = null;
  tagMap = null;
  groupMap = null;
  return html;
}

/**
 * 解析html引入资源，和解析编译code
 * */
function insetScript(html, item, code, config) {

  var param = URL.format(item.param||{});
  var src = item.src;
  var template;
  var location = item.location;
  if (item.codeType == "file") {
    var realFile = config.resolve.input(config.code.templatePath,src);//源文件
    var realWriteFile = config.resolve.output(config.code.templatePath,src);//目标文件
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
      wakeout.writeSync(realWriteFile, config.code.build(code))
    }
    template = "<script src='" + config.resolve.browser(src) + (param ? ("?" + param) : "") + "'></script>"
  } else {
    template = "<script>\n" + config.code.build(code) + "\n</script>"
  }

  if (location && (~html.indexOf("</" + location + ">"))) {
    html = html.slice(0, html.lastIndexOf("</" + location + ">")) + template + "\n" + html.slice(html.lastIndexOf("</" + location + ">"), html.length)
  } else {

    //设置了location，但是找不到location的位置
    if(location){
      console.log("warning:".warn, "html is not has </" + location + ">");
    }

    html = html + "\n" + template + "\n";
  }

  return html;
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