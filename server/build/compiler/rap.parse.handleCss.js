const wake = rap.system.input;
const wakeout = rap.system.output;
const {  parseTag } = require("./parse");
const less = require('less');
const codeStack = require("./rap.parse.codeStack")
const querystring = require('querystring');

//压缩css代码
rap.parse.compressionCss = function(code) {
  code = code.replace(/<\/\*[\u0000-\uFFFF]*?\*\//gm, "");
  code = rap.parse.wrap(/"[^\\]*?"/g, "___RAPcompressionQUOTONE__", code, function(wrapHtml1) {
    return rap.parse.wrap(/'[^\\]*?'/g, "___RAPQUOTTWO__", wrapHtml1, function(wrapHtml2) {
      return rap.parse.wrap(/(<pre[^>]*>)([\\u0000-\\uFFFF]*?)<\/pre>/igm, "___RAPcompressionPREAll__", wrapHtml2, function(wrapHtml3) {
        return wrapHtml3.replace(/\s+/igm, " ");
      })
    })
  })
  return code;
}

/**
 * 解析css,默认使用less编译,必须要用异步
 * */
function currentBuild(code, buildFlag, callback) {
  if (!buildFlag) {
    callback(code);
  }
  //异步
  less.render(code).then(output => {
    if (global.ENV == "product") {
      callback(rap.parse.compressionCss(output.css));
    }
    callback(output.css);
  }).catch(e => {
    console.log("error".error, e.message,e.stack);
    callback(`/**\n${e.message}\n**/`);
  });

}
//重新打包合并多个文件
function watchRebuildGroupFile(config, relativeWatch, watchFile, dirFile, stack) {
  relativeWatch[watchFile.toURI()] = function() {
    var code = getGroupCode(config, relativeWatch, stack)
    //写入编译之后的代码
    config.build(code, stack.build, function(code) {
      //写入编译之后的代码
      wakeout.writeSync(dirFile, code);
      rap.parse.parseFileByCssCode(code, config, relativeWatch) 
    })
  }
}

//重新打包一个文件
function watchRebuildFile(config, relativeWatch, watchFile, dirFile,stack) {
  relativeWatch[watchFile.toURI()] = function() {
    var code = wake.readDataSync(watchFile);
    //写入编译之后的代码

    config.build(code, stack.build, function(code) {
      //写入编译之后的代码
      wakeout.writeSync(dirFile, code);
      rap.parse.parseFileByCssCode(code, config, relativeWatch) 
    })
  }
}
/**
 * 解析合并
 * */
function getGroupCode(config, relativeWatch, stack) {
  var groupCode = [];
  var unique = [];

  //监听代理对象
  var dirFile = config.output(config.templatePath, stack.url); //目标文件

  stack.groupStack.forEach(item => {
    if (item.url) {
      if (~unique.indexOf(item.url)) { //去重
        console.log("warning".warn, "group:", stack.url, "has same item url", item.url);
        return;
      }
      unique.push(item.url);

      var srcPath = config.input(config.templatePath, item.url); //源地址

      //监听文件变化，代理到总的打包中
      watchRebuildGroupFile(config, relativeWatch, srcPath, dirFile, stack)

      if (wake.existsSync(srcPath)) {
        groupCode.push(wake.readDataSync(srcPath));
      } else {
        console.log("error:".error, "group merge not find :", srcPath);
      }

    } else if (item.content) {
      if (~unique.indexOf(item.content)) { //去重
        console.log("warning".warn, "group:", stack.url, "has same item content");
        return;
      }
      unique.push(item.content);

      groupCode.push(item.content);
    } else {
      console.log("error".error, " group ", stack.url, "not find")
    }
  })
  unique = null;
  return groupCode.join("\n;\n")
}

//插入的位置
function locationTag(html, stack, template) {

  if (stack.sort != "false") { //需要重排
    html = html.replace(stack.template, "");
    var location = stack.location || "head"; //js默认是body
    if (location && (~html.indexOf("</" + location + ">"))) {
      html = html.slice(0, html.lastIndexOf("</" + location + ">")) + template + "\n" + html.slice(html.lastIndexOf("</" + location + ">"), html.length)
    } else {

      //设置了location，但是找不到location的位置
      if (stack.location) {
        console.log("warning:".warn, "html is not has </" + location + ">");
      }

      html = html + "\n" + template + "\n"; //添加到后面
    }
  } else {
    html = html.replace(stack.template, template);
  }
  return html;
}

/**
 * 解析html引入资源，和解析编译code
 * */
function insetCode(html, config, relativeWatch, stack, compile) {

  var template, param, code, browserUrl; //需要参数和模板代码

  //替换有link
  function replaceTagBySrc() {
    param = querystring.stringify(stack.param || {});
    param = (param ? ("?" + param) : "");
    browserUrl = config.browser(stack.url,".css") + param;
    template = `<link href='${browserUrl}' rel="stylesheet"/>`;
    return template
  }


  //不需要处理
  if (stack.codeType == "igrone") {
    compile("",false);
    //本地css文件
  } else if (stack.codeType == "file") {

    var srcFile = config.input(config.templatePath, stack.url); //源文件
    var dirFile = config.output(config.templatePath, stack.url, ".css"); //目标文件



    //合并css
    if (stack.group) {
      code = getGroupCode(config, relativeWatch, stack);
    } else { //解析单个css文件

      if (!wake.existsSync(srcFile)) {
        console.log("error:".error, ` parse css not not find ${srcFile}`);
        code = `console.error("parse css not not find ${srcFile}"")`; //提示没有文件
      } else {
        stack.param.version = wake.getModifySync(srcFile);
        code = wake.readDataSync(srcFile);
        watchRebuildFile(config, relativeWatch, srcFile, dirFile,stack)
      }
    }

    config.build(code, stack.build, function(code) {
      //写入编译之后的代码
      wakeout.writeSync(dirFile, code);
      rap.parse.parseFileByCssCode(code, config, relativeWatch) 
      compile(replaceTagBySrc(),true);
    })


    //远程js文件
  } else if (stack.codeType == "remotefile") {
    compile(replaceTagBySrc(),true);
    //内联js代码
  } else if (stack.codeType == "code") {
    code = config.build(stack.content, stack.build, function(code) {
      template = `<style>${code}</style>`
      compile(template,true);
    });

  } else {
    compile("",false);
  }

}
/**
 * 解析css,默认使用less编译,必须要用异步
 * */
rap.parse.handleCSS = function(orgHtml, config, relativeWatch, callback) {

  if (config.complie) {
    console.log("warn".warn, "current html handling css");
    return;
  }

  config.complie = true;

  //编译的时候使用了异步
  rap.parse.clearNoteWrap(orgHtml, function(html, recover) {

    config.build = config.build || currentBuild;


    var tags = parseTag("link", html, "single");

    tags = tags.filter(item => {
      var rel = item.attrs.rel;
      if (rel == "stylesheet") {
        return true;
      } else {
        return false;
      }
    })

    var styleTags = parseTag("style", html);

    //得到一个按结构的顺序排列
    var sourceTags = tags.concat(styleTags).sort(function(a, b) {
      return a.mapIndex > b.mapIndex ? 1 : -1;
    })
    var stackCount = 0;
    codeStack(sourceTags, config, ".css",
      function(stack, idx, len) {
        insetCode(html, config, relativeWatch, stack, (template, locationFlag) => {
          if (locationFlag) {
            html = locationTag(html, stack, template);
          } else {
            html = html.replace(stack.template, template);
          }
          //全部解析完毕
          stackCount++;
          if (stackCount == len) {
            //需要还原之后返回
            callback(recover(html));
            config.complie = false;
          }
        });
      });
    return "";
  })

}