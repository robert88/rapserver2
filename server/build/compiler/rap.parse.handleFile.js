const { parseTag } = require("./parse");
const querystring = require('querystring');
const URL = require('url');
const wake = rap.system.input;
const wakeout = rap.system.output;
const babel = require("@babel/core");
const less = require('less');
const pt = require("path")
/**
 * 拷贝文件，并且得到浏览路径,处理preload和css和js的时候需要编译
 * */
function copyFile(m1, comeFrom, config, relativeWatch) {
  if ((/^https?:/i.test(m1) || /^\/\//i.test(m1)) || /^data:/.test(m1) || pt.extname(m1) == ".html" || pt.extname(m1) == ".htm" || !pt.extname(m1)) {
    return m1;
  } else {
    var param = URL.parse(m1.trim(), true).query || {}; //必须提前解析param,URL.parse第二个参数为true才能保证输出的是对象
    var src = m1.split("?")[0];
    var outpath = config.output(config.templatePath, src);
    var inpath = config.input(comeFrom, src);
    var browserPath = config.browser(src);
    //只需要拷贝
    relativeWatch[inpath.toURI()] = function() {
      copyFileByType(inpath, outpath);
    };
    if (wake.existsSync(inpath)) {
      if (inpath == outpath) {
        console.error("cope file src==dir", inpath);
      } else {
        copyFileByType(inpath, outpath);
      }

      param.version = wake.getModifySync(inpath);
      param = querystring.stringify(param || {});
      param = (param ? ("?" + param) : "");
      return browserPath + param;
    } else {
      console.log("not find resource:".error, m1);
      return m1;
    }
  }
}

function copyFileByType(inpath, outpath) {
  if (pt.extname(inpath) == ".less") {
    renderCss(inpath, wake.readDataSync(inpath), (code) => {
      wakeout.writeSync(outpath, code);
    })
    //将es文件转为js
  } else if (pt.extname(inpath) == ".es") {

    wakeout.writeSync(outpath, renderJs(wake.readDataSync(inpath)));

  } else {
    wakeout.copySync(inpath, outpath);
  }
}

function renderCss(src, code, callback) {
  var path = pt.dirname(src);
  //异步
  less.render(code, { paths: [path] }).then(output => {
    if (global.ENV == "product") {
      return rap.parse.compressionCss(output.css)
    } else {
      return output.css
    }
  }).catch(e => {
    console.log("error".error, e.message, e.stack);
    callback(`/**\n${e.message}\n**/`);
  }).then((code) => {
    callback(code);
  });
}

function renderJs(code) {
  var babelT = babel.transformSync(code, {
    "presets": [
      "@babel/preset-env"
    ],
    cwd: localRequire("@/", true),
    root: localRequire("@/", true),
  })
  //上线打包
  if (global.ENV == "product") {
    return rap.parse.compressionJs(babelT.code);
  } else {
    return babelT.code.replace(/^\s*\"use\sstrict\";\s+/, "")
  }
}
/**
 * 解析url()文件
 * */
function parseFileByCssCode(code, comeFrom, config, relativeWatch) {
  return code.replace(/url\(([^\)]+)\)/gi, function(m, m1) {
    m1 = m1.split("?")[0].split("#")[0].replace(/"|'/g, "");
    var browserPath = copyFile(m1, comeFrom, config, relativeWatch);
    return "url(" + browserPath + ")";
  })
}

rap.parse.parseFileByCssCode = parseFileByCssCode;

//html是已经过滤好的html结构
function handleFile(html, config, relativeWatch) {
  //解析css中的图片
  var styleTags = parseTag("style", html);

  styleTags.forEach(item => {
    html = html.replace(item.template, parseFileByCssCode(item.template, config.templatePath, config, relativeWatch));
  });

  //解析标签中的图片

  config.fileAttrs.forEach(attrItem => {
    var reg = new RegExp("\\s" + attrItem + "\\s*=\\s*(\")([\\u0000-\\uFFFF]*?[^\\\\])\"|" + attrItem + "\\s*=\\s*(')([\\u0000-\\uFFFF]*?[^\\\\])\'", "igm")
    html = html.replace(reg, function(m, quot, m1) {
      var ret;
      if (!m1) {
        //后面的括号匹配不到
        var reReg = new RegExp("\\s*" + attrItem + "\\s*=\\s*(')([\\u0000-\\uFFFF]*?[^\\\\])\'", "igm").exec(m);
        quot = reReg[1]
        m1 = reReg[2]
      }
      if (attrItem == "style") {
        ret = parseFileByCssCode(m1, config.templatePath, config, relativeWatch);
      } else {
        var browserPath = copyFile(m1, config.templatePath, config, relativeWatch);
        ret = browserPath;
      }
      return " " + attrItem + "=" + quot + ret + quot;
    })
  })

  //去掉解析html中的link rel build
  var linkTags = parseTag("link", html, "single");

  linkTags.forEach(item => {
    if (item.attrs.rel == "build") {
      html = html.replace(item.template, "");
    }
  });

  return html;

}
/**
 * 解析file
 * */
rap.parse.handleFile = function(orgHtml, config, relativeWatch) {

  return rap.parse.clearNoteWrap(orgHtml, function(clearNotehtml) {
    return rap.parse.clearCssWrap(clearNotehtml, clearCssHtml => {
      return rap.parse.clearJsWrap(clearCssHtml, clearjsHtml => {
        return handleFile(clearjsHtml, config, relativeWatch)
      })
    })
  });
}