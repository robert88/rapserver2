const { parseTag } = require("./parse");
const querystring = require('querystring');
const URL = require('url');
const wake = rap.system.input;
const wakeout = rap.system.output;
/**
 * 拷贝文件，并且得到浏览路径
 * */
function copyFile(m1, config, relativeWatch) {
  if ((/^https?:/i.test(m1) || /^\/\//i.test(m1))||/^data:/.test(m1)) {
    return m1;
  } else {
    var param = URL.parse(m1.trim(), true).query || {}; //必须提前解析param,URL.parse第二个参数为true才能保证输出的是对象
    var src = m1.split("?")[0];
    var outpath = config.output(config.templatePath, src);
    var inpath = config.input(config.templatePath, src);
    var browserPath = config.browser(src);
    //只需要拷贝
    relativeWatch[inpath.toURI()] = function() {
      wakeout.copySync(inpath, outpath);
    };
    if (wake.existsSync(inpath)) {
      wakeout.copySync(inpath, outpath);
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
/**
 * 解析url()文件
 * */
function parseFileByCssCode(code, config, relativeWatch) {
  return code.replace(/url\(([^\)]+)\)/gi, function(m, m1) {
    var browserPath = copyFile(m1, config, relativeWatch);
    return "url(" + browserPath + ")";
  })
}

rap.parse.parseFileByCssCode = parseFileByCssCode;

//html是已经过滤好的html结构
function handleFile(html, config, relativeWatch) {
  //解析css中的图片
  var styleTags = parseTag("style", html);

  styleTags.forEach(item => {
    html = html.replace(item.template, parseFileByCssCode(item.template, config, relativeWatch));
  });

  //解析标签中的图片

  config.fileAttrs.forEach(attrItem => {

    html = html.replace(new RegExp(attrItem + "\s*=\s*(\")([\\u0000-\\uFFFF]*?[^\\\\])\"|" + attrItem + "\\s*=\\s*(')([\\u0000-\\uFFFF]*?[^\\\\])\'", "igm"), function(m, quot, m1) {
      var ret;
      if (!m1) {
        //后面的括号匹配不到
        var reReg = new RegExp(attrItem + "\\s*=\\s*(')([\\u0000-\\uFFFF]*?[^\\\\])\'", "igm").exec(m);
        quot = reReg[1]
        m1 = reReg[2]
      }
      if (attrItem == "style") {
        ret = parseFileByCssCode(m1, config, relativeWatch);
      } else {
        var browserPath = copyFile(m1, config, relativeWatch);
        ret = browserPath;
      }
      return attrItem + "=" + quot + ret + quot;
    })
  })

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