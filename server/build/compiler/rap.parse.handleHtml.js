const wake = rap.system.input;
const { clearNoteTag, parseTag } = require("./parse");
const parseTemplate = require("./template");

rap.parse = rap.parse || {}

function byTag(tag, orgHtml, config, parentData, relativeWatch, unique) {

  orgHtml = clearNoteTag(tag, orgHtml);

  var tags = parseTag(tag, orgHtml);

  tags.forEach(function(tagInfo) {

    //路径必须在config里面配置
    var src = config.input(parentData.__templateFile__ || "", tagInfo.attrs.src || "");

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
    var slotName = tagInfo.attrs.name;

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
        console.log("warning:".warn, parseData.__templateFile__, ("-> slot name=(" + slotName + ") not find:").warn, " in ", src);
      }
    }else if(slotsTag.length){
      console.log("warning:".warn, parseData.__templateFile__, ("-> slot name=(" + slotName + ") not find:").warn, " in ", src);
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

  orgHtml = config.parseTemplate ? config.parseTemplate(orgHtml, parseData) : parseTemplate(orgHtml, parseData);

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


/*
* entryFile 入口文件
* config 编译html的配置文件
* parentData 入口数据
* parentRelativeWatch 父类监听，第一次是父类，第二次是自己
* unique 是
* 通过html文件来解析
*/
rap.parse.byHtmlFile = function(entryFile, config, parentData, parentRelativeWatch, unique) {

  unique = unique || {};
  parentData = parentData || {}
  var suffix = parentData.suffix = parentData.suffix || "cn";

  //获取文件的模板
  var noSuffixFile = entryFile.replace("." + suffix + ".html", ".html"); //没有后缀的html文件
  entryFile = noSuffixFile.replace(".html", "." + suffix + ".html");

  var orgHtml, __templateFile__;
  if (wake.existsSync(entryFile) && wake.isFileSync(entryFile)) {
    orgHtml = wake.readDataSync(entryFile);
    __templateFile__ = entryFile;
  } else if (wake.existsSync(noSuffixFile) && wake.isFileSync(noSuffixFile)) {
    orgHtml = wake.readDataSync(noSuffixFile);
    __templateFile__ = noSuffixFile;
  } else {
    console.log("error:".error, "not find entry file", entryFile, " and ", noSuffixFile)
    return "";
  }


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

  if (localData.__relativeWatch__) {
    Object.assign(parentRelativeWatch, localData.__relativeWatch__)
  }

  //监听
  parentRelativeWatch[noSuffixFile.toURI()] = 1; //同时添加两个监听，删除和添加也可以被监听到
  parentRelativeWatch[entryFile.toURI()] = 1;
  parentRelativeWatch[dataFile.toURI()] = 1; //数据文件依赖,可以通过__relativeWatch__来添加数据依赖

  var parseData = rap.extend("deepNotArray", {}, localData, parentData); //深度拷贝，但是对于数组不需要深度拷贝

  parseData.__parentTemplateFile__ = parentData && parentData.__templateFile__; //用于跟踪模板
  parseData.__templateFile__ = __templateFile__; //用于跟踪模板

  orgHtml = rap.parse.byHtml(orgHtml, config, parseData, parentRelativeWatch, unique);

  return orgHtml;

}

//压缩html代码
rap.parse.compressionHtml = function(outHtmlFile) {
  outHtmlFile = outHtmlFile.replace(/<!--[\u0000-\uFFFF]*?-->/gm, "");
  outHtmlFile = rap.parse.wrap(/"[^\\]*?"/g, "___RAPcompressionQUOTONE__", outHtmlFile, function(wrapHtml1) {
    return rap.parse.wrap(/'[^\\]*?'/g, "___RAPcompressionQUOTTWO__", wrapHtml1, function(wrapHtml2) {
      return rap.parse.wrap(/(<pre[^>]*>)([\u0000-\uFFFF]*?)<\/pre>/igm, "___RAPcompressionPREAll__", wrapHtml2, function(wrapHtml3) {
        return rap.parse.wrap(/(<script[^>]*>)([\u0000-\uFFFF]*?)<\/script>/igm, "___RAPcompressionPRESCRIPT__", wrapHtml3, function(wrapHtml4) {
          return rap.parse.wrap(/(<style[^>]*>)([\u0000-\uFFFF]*?)<\/style>/igm, "___RAPcompressionSTYLE__", wrapHtml4, function(wrapHtml5) {
            return wrapHtml5.replace(/\s+/igm, " ");
          })
        })
      })
    })
  })
  return outHtmlFile;
}