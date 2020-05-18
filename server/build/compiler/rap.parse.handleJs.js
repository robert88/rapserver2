const wake = rap.system.input;
const wakeout = rap.system.output;
const { parseTag } = require("./parse");
const UglifyJS = require("uglify-js");
const babel = require("@babel/core");
const codeStack = require("./rap.parse.codeStack");
const querystring = require('querystring');

//压缩js代码
rap.parse.compressionJs = function(code, options) {
  options = Object.assign({}, options);
  var result = UglifyJS.minify(code, options);
  return result.code;
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


//重新打包合并多个文件
function watchRebuildGroupFile(config, relativeWatch, watchFile, dirFile, stack) {
  relativeWatch[watchFile.toURI()] = function() {
    var code = getGroupCode(config, relativeWatch, stack)
    //写入编译之后的代码
    wakeout.writeSync(dirFile, config.build(code, stack.build));
  }
}

//重新打包一个文件
function watchRebuildFile(config, relativeWatch, watchFile, dirFile) {
  relativeWatch[watchFile.toURI()] = function() {
    var code = wake.readDataSync(srcFile);
    //写入编译之后的代码
    wakeout.writeSync(dirFile, config.build(code));
  }
}

//babel编译
function currentBuild(code, buildFlag) {
  if (!buildFlag) {
    return code;
  }
  var babelT = babel.transformSync(code, {
    "presets": [
      "@babel/preset-env"
    ]
  })
  //上线打包
  if (global.ENV == "product") {
    return rap.parse.compressionJs(babelT.code);
  } else {
    return babelT.code.replace(/^\s*\"use\sstrict\";\s+/, "")
  }
}

/*
将代码打包到指定位置，并且替换html的引用路径
*/
function insetCode(html, config, relativeWatch, stack) {
  var template, param, code, browserUrl; //需要参数和模板代码

  //替换有src的script标签
  function replaceTagBySrc() {
    param = querystring.stringify(stack.param || {});
    param = (param ? ("?" + param) : "");
    browserUrl = config.browser(stack.url) + param;
    template = `<script src='${browserUrl}'></script>`;
    locationTag();

  }

  //插入的位置
  function locationTag() {

    if (stack.sort != "false") { //需要重排
      html = html.replace(stack.template, "");
      var location = stack.location || "body"; //js默认是body
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

  }
  //不需要处理
  if (stack.codeType == "igrone") {
    html = html.replace(stack.template, "");

    //本地js文件
  } else if (stack.codeType == "file") {

    var srcFile = config.input(config.templatePath, stack.url); //源文件
    var dirFile = config.output(config.templatePath, stack.url); //目标文件

    //合并js
    if (stack.group) {
      code = getGroupCode(config, relativeWatch, stack);
    } else { //解析单个js文件

      if (!wake.existsSync(srcFile)) {
        console.log("error:".error, ` parse js not not find ${srcFile}`);
        code = `console.error("parse js not not find ${srcFile}"")`; //提示没有文件
      } else {
        stack.param.version = wake.getModifySync(srcFile);
        code = wake.readDataSync(srcFile);
        watchRebuildFile(config, relativeWatch, srcFile, dirFile)
      }
    }

    //写入编译之后的代码
    wakeout.writeSync(dirFile, config.build(code, stack.build));

    replaceTagBySrc();

    //远程js文件
  } else if (stack.codeType == "remotefile") {
    replaceTagBySrc();

    //内联js代码
  } else if (stack.codeType == "code") {
    code = config.build(stack.content, stack.build);
    template = `<script>${code}</script>`
    locationTag();
  }

  return html;
}

/**
 * 解析js
 * */
rap.parse.handleJs = function(orgHtml, config, relativeWatch) {

  if (config.complie) {
    console.log("warn".warn, "current html handling js");
    return;
  }

  config.complie = true;

  //过滤掉注释
  return rap.parse.clearNoteWrap(orgHtml, function(html) {

    config.build = config.build || currentBuild; //默认bebal编译

    var tags = parseTag("script", html); //得到html中的js资源文件

    //解析js代码，过滤模板代码
    tags = tags.filter(tag => {
      var type = tag.attrs.type;
      if (type && (type != "text/javascript" || type != "text/ecmascript" || type != "application/ecmascript" || type != "application/javascript" || type != "text/vbscript")) {
        return false;
      } else {
        return true;
      }
    })

    //得到要编译的js信息
    codeStack(tags, config, ".js",
      function(stack) {
        html = insetCode(html, config, relativeWatch, stack);
      });
    config.complie = false;
    return html;
  })

}