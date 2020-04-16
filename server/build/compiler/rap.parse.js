const wake = rap.system.input;
const { clearNoteTag, parseTag } = require("./parse");
const parseTeample = require("./template");
const pt = require("path");

var root = __dirname.toURI().replace("/server/build/compiler", "");

//默认的
function resolve(templatePath, resolvePath) {
  if (resolvePath.trim().toURI().indexOf("/") == 0) {
    return root + resolvePath.trim().toURI();
  } else {
    return pt.resolve(pt.dirname(templatePath), resolvePath);
  }
}


rap.parse = rap.parse || {}

rap.parse.byTag = function(tag, orgHtml, config, parentData, relativeWatch, unique) {

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
  return rap.parse.byTag("useSlot", orgHtml, config, parentData, relativeWatch, unique)
}
/*
解析include 标签
*/
rap.parse.byInclude = function(orgHtml, config, parentData, relativeWatch, unique) {
  return rap.parse.byTag("include", orgHtml, config, parentData, relativeWatch, unique)
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

  config.resolve = config.resolve || resolve;

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

function sortTag(tag, html) {
  var sortArr = {};
  var notSortArr = {};
  var sortTags = parseTag(tag, html);
  sortTags.forEach(function(tag) {
    var notSort = tag.template.indexOf("notSort") != -1;
    var src = tag.attrs["src"];
    if (src && !notMove) {
      jsArr[src] = scriptFile.template;
      html = html.replace(scriptFile.template, "");
    } else if (notMove && notSort[src]) {
      console.log("warn:".warn,)
      html = html.replace(scriptFile.template, "");
    } else {
      notSortArr[src] = 1
    }
  });

}
/**
 * 解析将js重新排序
 * */
rap.parse.sortJs = function(html) {
  var sortArr = {};
  var sortTags = parseTag("script", html);
  scripts.forEach(function(scriptFile) {
    var notSort = scriptFile.template.indexOf("notSort") != -1;
    var src = scriptFile.attrs["src"];
    if (src && !notMove) {
      jsArr[src] = scriptFile.template;
      html = html.replace(scriptFile.template, "");
    } else if (notMove && jsArr[src]) {

    }
  });

  // jsArr = rap.unique(jsArr);
  var jsstrArr = []
  Object.keys(jsArr).forEach(key => {
    jsstrArr.push(jsArr[key])
  })

  if (~html.indexOf("</body>")) {
    html = html.slice(0, html.lastIndexOf("</body>")) + jsstrArr.join("\n") + html.slice(html.lastIndexOf("</body>"), html.length)
  } else {
    console.log("error:html is not has </body>");
  }
  return html;
}
/**
 * 解析将css添加到head后面
 * */
rap.parse.sortCss = function(html) {
  var cssArr = {};
  var scripts = parseTag("link", html, true);
  scripts.forEach(function(scriptFile) {
    var notMove = scriptFile.template.indexOf("notsort") != -1;
    var src = scriptFile.attrs["href"];
    var rel = scriptFile.attrs["rel"];
    if (src && !notMove && rel == "stylesheet") {
      cssArr[src.split("?")[0]] = scriptFile.template;
      html = html.replace(scriptFile.template, "");
    }
  });
  var cssstrArr = []
  Object.keys(cssArr).forEach(key => {
    cssstrArr.push(cssArr[key])
  })

  // cssArr = rap.unique(cssArr);
  // var cssSrc = [];
  // cssArr.forEach(function (src) {
  //     cssSrc.push("<link href='"+src+"' rel='stylesheet'/>");
  // });

  if (~html.indexOf("</head>")) {
    html = html.replace(/<\/head>/i, function() { return (cssstrArr.join("\n") + "</head>") })
  } else {
    console.log("error:html is not has </head>");
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

#### 后缀文件

    如参数的后缀为cn,那么html文件为xxx.cn.html,数据文件为xxx.cn.js
*/