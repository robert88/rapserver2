var makedown;;
(function() {

  //入口
  makedown = function(str) {

    if (!str) {
      return "";
    }

    str = str.replace(/(\n|\r)+/g, "\n").replace(/<!--[\u0000-\uFFFF]*?-->/gm, "\n");
    var strs = str.split(/\n/);
    var token = [];
    for (var i = 0; i < strs.length; i++) {
      var className = i == 0 ? "first-inner" : ""
      var s = htmlToString(strs[i]);
      s = s.replace(/^\s+|\s+$/g, "");
      if (/^\*+$/.test(s)) {
        token.push({ type: "singleTag", tag: "hr", className: className })
      } else if (/^(#+)\s/.test(s)) {
        var rule = RegExp.$1;
        token.push({ str: s.replace(rule, ""), type: "tag", tag: "H" + rule.length, className: className });
      } else if (/^\+\s/.test(s) || /^\-\s/.test(s)) {
        var endInfo = findEnd(strs, i, function(val) {
          return /^[^\+]/.test(val) && /^[^\-]/.test(val);
        }, true);
        token.push({ str: endInfo.str, type: "list", className: className });
        i = endInfo.index - 1;
      } else if (/^```\s*(\w*)$/.test(s)) {
        var code = RegExp.$1;
        var endInfo = findEnd(strs, i, function(val) {
          return /^```/.test(val);
        }, false);
        token.push({ str: endInfo.str, type: "code", code: code, className: className });
        i = endInfo.index;
      } else if (/^\|/.test(s)) {
        var endInfo = findEnd(strs, i, function(val) {
          return val == "" || /^[^\|]/.test(val);
        }, true);
        token.push({ str: endInfo.str, type: "table", className: className });
        i = endInfo.index - 1;
      } else if (strs.length > 1) {
        token.push({ str: s, type: "tag", tag: "p" })
      } else {
        token.push({ str: s, type: "tag", tag: "div", className: className })
      }
    }

    var tokenStr = [];
    token.forEach(item => {
      var ret = "";
      switch (item.type) {
        case "table":
          ret = parseTable(item);
          break;
        case "tag":
          ret = parseTag(item);
          break;
        case "singleTag":
          ret = "<" + item.tag + "/>";
          break;
        case "code":
          ret = parseCode(item);
          break;
        case "list":
          ret = parseList(item);
          break;
      }
      if (item.type != "code") {
        ret = parseImg(ret);
        ret = parseButton(ret);
        ret = parseLink(ret); //再img button之后来parse link
        ret = parseSlash(ret);
        ret = parseBlod(ret);
        ret = parseDel(ret);
      }
      tokenStr.push(ret);
    })

    return tokenStr.join("\n");
  }

  function parseImg(ret) {
    //.*?惰性匹配
    return ret.replace(/\!\[(.*?)\]\((.*?)\)/gm, function(m, m1, m2) {
      var text = m1 || "";
      var splitStr = m2.indexOf("'") > m1.indexOf("\"") ? "'" : "\""
      m2 = m2.split(splitStr)
      var src = m2[0] ? ('src="' + m2[0] + '"') : "";
      var title = m2.slice(1, m2.length - 1).join(splitStr) || text;
      return "<img " + src + " alt='" + text + "' title='" + title + "' >";
    })
  }

  function parseButton(ret) {
    //.*?惰性匹配
    return ret.replace(/\[\^(.*?)\]\((.*?)\)/gm, function(m, m1, m2) {
      var text = m1 || "";
      var splitStr = m2.indexOf("'") > m1.indexOf("\"") ? "'" : "\""
      m2 = m2.split(splitStr)
      var src = m2[0] ? ('href="' + m2[0] + '"') : "";
      var className = m2.slice(1, m2.length - 1).join(splitStr) || text;
      return "<a " + src + " class='" + className + " btn' title='" + text + "' >" + text + "</a>";
    }).replace(/\[\^(.*?)\]/gm, function(m, m1) {
      var text = m1 || "";
      return "<a class='btn' title='" + text + "' >" + text + "</a>";
    })
  }

  function parseLink(ret) {
    //.*?惰性匹配
    return ret.replace(/\[(.*?)\]\((.*?)\)/gm, function(m, m1, m2) {
      var text = m1 || "";
      var splitStr = m2.indexOf("'") > m1.indexOf("\"") ? "'" : "\""
      m2 = m2.split(splitStr)
      var src = m2[0] ? ('href="' + m2[0] + '"') : "";
      var title = m2.slice(1, m2.length - 1).join(splitStr) || text;
      return "<a " + src + "  title='" + title + "' >" + text + "</a>";
    }).replace(/\((.*?)\)/gm, function(m, m1, index) {
      //当前为括号
      if (ret[index - 1] == "\\") {
        return m;
      }
      if (/[-A-Za-z0-9+&@#\/%?=~_|!:,\.;]+[-A-Za-z0-9+&@#/%=~_|]/.test(m1)) {
        return "<a href='" + m1 + "' >" + m1 + "</a>";
      }
      return m;
    })
  }

  function parseSlash(ret) {

    //.*?惰性匹配
    return ret.replace(/\*([^\s,\.。，‘’“”"'\?？\}\{]+)\*/gm, function(m, m1, index) {
      //当前为括号
      if (ret[index - 1] == "\\") {
        return m;
      }

      return "<i>" + m1 + "</i>"
    })
  }

  function parseBlod(ret) {
    //.*?惰性匹配
    return ret.replace(/_([^\s,\.。，‘’“”"'\?？\}\{]+)_/gm, function(m, m1, index) {
      //当前为括号
      if (ret[index - 1] == "\\") {
        return m;
      }
      return "<strong>" + m1 + "</strong>"
    })
  }

  function parseDel(ret) {
    //.*?惰性匹配
    return ret.replace(/\~([^\s,\.。，‘’“”"'\?？\}\{]+)\~/gm, function(m, m1, index) {
      //当前为括号
      if (ret[index - 1] == "\\") {
        return m;
      }
      return "<del>" + m1 + "</del>"
    })
  }

  //生成table
  function parseTable(item) {
    var trs = item.str.split(/\n/);
    var str = "";
    var tdClass = [];
    var className = item.className || ""
    trs.forEach(function(tr, i) {
      var tds = tr.split(/\|/);
      var tdstr = "";

      // 去掉两边
      tds = tds.slice(1, tds.length - 1);
      var len = 0;
      //区分th和td
      function getTd(tag, td, j) {
        if (len) {
          if (tdClass[j]) {
            tdstr += '<' + tag + ' class="' + tdClass[j] + '" colspan="' + len + '">' + td + '</' + tag + '>'
          } else {
            tdstr += '<' + tag + '" colspan="' + len + '">' + td + '</' + tag + '>'
          }

        } else {
          if (tdClass[j]) {
            tdstr += '<' + tag + ' class="' + tdClass[j] + '">' + td + '</' + tag + '>'
          } else {
            tdstr += '<' + tag + '>' + td + '</' + tag + '>'
          }

        }
      }
      //td，th
      tds.forEach(function(td, j) {
        if (td == "") {
          len++;
        } else {
          if (i == 0) {
            getTd("th", td, j);
          } else if (i == 1 && /^[:\-\|\s]+$/.test(tr)) {
            if (/^:\-+:$/.test(td.replace(/\s+/g, ""))) {
              tdClass[j] = "tc"
            } else if (/\-:$/.test(td.replace(/\s+/g, ""))) {
              tdClass[j] = "tr"
            }
          } else {
            getTd("td", td, j);
          }
          len = 0;
        }
      })
      if (i == 0) {
        str += "<table class='" + className + "'><thead><tr>" + tdstr + "</tr></thead><tbody>\n"
      } else if (i != 1 || (i == 1 && !/^[:\-\|\s]+$/.test(tr))) {
        str += "<tr>" + tdstr + "</tr>\n"
      }
    })
    str += "</tbody></table>";
    return str;
  }

  //生成tag
  function parseTag(item) {
    var tags = item.tag.split(",");
    var start = [];
    var end = [];
    tags.forEach(function(tag) {
      if (!item.className) {
        start.push("<" + tag + ">");
      } else {
        start.push("<" + tag + " class='" + item.className + "'>");
      }

      end.unshift("</" + tag + ">");
    })
    return start.join("") + item.str + end.join("");
  }

  //生成code
  function parseCode(item) {
    var strs = item.str.split(/\n/);
    strs = strs.slice(1, strs.length - 1);
    var className = item.className || "";
    if (item.code.indexOf("col") != -1) {
      var strP = strs.join("\n").split(/\n[\-]+\n[\-]+\n/);
      var strLen = strP.length;
      var ret = "<ul class='col max" + strLen + " " + className + "'>";
      strP.forEach(function(val) {
        ret += '<li class="' + item.code + '">' + makedown(val) + '</li>'
      })
      return ret + "</ul>"
    } else {
      return '<pre  class="' + className + '"><code class="' + item.code + '">' + strs.join("\n") + '</code></pre>'
    }
  }

  //生成item
  function parseList(item) {
    var strs = item.str.split(/\n/);
    var len = 0;
    var ret = "";
    var className

    function getList(val, flag) {
      var plus = RegExp.$1;
      if (plus.length > len) {
        if (len != 0) {
          ret += "<em class='more'></em>"
        }
        if (len == 0) {
          className = item.className || "";
        } else {
          className = "";
        }
        ret += "<ul class='list " + className + "'>\n" + "<li class='makedownListLi " + (flag ? "open" : "") + "'>" + val.replace(plus, "")
      } else if (plus.length < len) {
        ret += "</li>\n</ul></li class='makedownListLi " + (flag ? "open" : "") + "'>\n" + "<li>" + val.replace(plus, "")
      } else {
        ret += "</li><li class='makedownListLi " + (flag ? "open" : "") + "'>" + val.replace(plus, "") + "\n"
      }
      len = plus.length;
    }
    strs.forEach(function(val) {
      if (/^\s*(\++)/.test(val)) {
        getList(val, false)
      } else if (/^\s*(\-+)/.test(val)) {
        getList(val, true)
      }
    })
    if (ret) {
      ret += "</li>\n</ul>"
    }

    return ret;
  }
  //去html化
  function htmlToString(str) {
    return str.replace(/>/gm, "&gt;")
      .replace(/</gm, "&lt;")
  }

  //找到闭合的
  function findEnd(strs, i, reg, include, endInfo) {
    reg.lastIndex = 0;
    endInfo = endInfo || { str: htmlToString(strs[i]) };
    endInfo.index = i + 1;
    if (endInfo.index >= strs.length) {
      return endInfo;
    }
    //需要去掉两边空格
    if (reg(strs[endInfo.index].replace(/^\s+|\s+$/, ""))) {
      if (!include) {
        endInfo.str = endInfo.str + "\n" + htmlToString(strs[endInfo.index]);
      }
      return endInfo
    }
    endInfo.str = endInfo.str + "\n" + htmlToString(strs[endInfo.index]);
    return findEnd(strs, endInfo.index, reg, include, endInfo)

  }

  function clickLi(t, c) {
    if (~c.indexOf("open")) {
      c = c.replace("open", "");
    } else {
      c += " open";
    }
    t.setAttribute("class", c)
  }

  document.addEventListener("click", function(e) {
    e = window.event || e;
    var target = e.target || e.srcElement;
    if (target) {
      var className = target.getAttribute("class") //不兼容ie8及以下版本
      var parentClassName = target.parentNode && target.parentNode.getAttribute("class") //不兼容ie8及以下版本
      if (className && parentClassName) {
        if (className.indexOf("makedownListLi") != -1) {
          clickLi(target, className)
        } else if (parentClassName.indexOf("makedownListLi") != -1) {
          clickLi(target.parentNode, parentClassName);
        }
      }
    } else {
      console.log("error")
    }
  })

})()