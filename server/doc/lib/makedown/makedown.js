var tagMap = {
  r: "hr",
  b: "strong",
  s: "del",
  ib: "i,strong"
}
//入口
var makedown = function(str) {

  if (!str) {
    return "";
  }

  var strs = str.split(/\n|\r/);
  var token = [];
  for (var i = 0; i < strs.length; i++) {
    var s = htmlToString(strs[i]);
    s = s.replace(/^\s+|\s+$/g, "");
    if (/^\*+$/.test(s)) {
      token.push({ type: "singleTag", tag: "hr" })
    } else if (/^(#+)\s/.test(s)) {
      var rule = RegExp.$1;
      token.push({ str: s.replace(rule, ""), type: "tag", tag: "H" + rule.length });
    } else if (/^\+\s/.test(s)) {
      var endInfo = findEnd(strs, i, function(val) {
        return /^[^\+]/.test(val);
      }, true);
      token.push({ str: endInfo.str, type: "list" });
      i = endInfo.index - 1;
    } else if (/^```\s*(\w*)$/.test(s)) {
      var code = RegExp.$1;
      var endInfo = findEnd(strs, i, function(val) {
        return /^```/.test(val);
      }, false);
      token.push({ str: endInfo.str, type: "code", code: code });
      i = endInfo.index;
    } else if (/^\|/.test(s)) {
      var endInfo = findEnd(strs, i, function(val) {
        return val == "" || /^[^\|]/.test(val);
      }, true);
      token.push({ str: endInfo.str, type: "table" });
      i = endInfo.index - 1;
    } else {
      token.push({ str: s, type: "tag", tag: "p" })
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
    if (item.type != code) {
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
    var splitStr = m2.indexOf("'") > m1.indexOf("\"")?"'":"\""
    m2 = m2.split(splitStr)
    var src = m2[0] ? ('src="' + m2[0]  + '"') : "";
    var title = m2.slice(1,m2.length-1).join(splitStr)||text;
    return "<img " + src + " alt='" + text + "' title='" + title + "' >";
  })
}

function parseButton(ret) {
  //.*?惰性匹配
  return ret.replace(/\[\^(.*?)\]\((.*?)\)/gm, function(m, m1, m2) {
    var text = m1 || "";
    var splitStr = m2.indexOf("'") > m1.indexOf("\"")?"'":"\""
    m2 = m2.split(splitStr)
    var src = m2[0] ? ('href="' + m2[0]  + '"') : "";
    var className = m2.slice(1,m2.length-1).join(splitStr)||text;
    return "<a " + src + " class='" + className + " btn' title='" + text + "' >" + text + "</a>";
  }).replace(/\[\^(.*?)\]/gm, function(m, m1) {
    var text = m1 || "";
    return "<a class='btn' title='" + text + "' >" + text + "</a>";
  })
}

function parseLink(ret) {
  //.*?惰性匹配
  return ret.replace(/\[(.*?)\]\((.*?)\)/gm, function(m, m1,m2) {
    var text = m1 || "";
    var splitStr = m2.indexOf("'") > m1.indexOf("\"")?"'":"\""
    m2 = m2.split(splitStr)
    var src = m2[0] ? ('href="' + m2[0]  + '"') : "";
    var title = m2.slice(1,m2.length-1).join(splitStr)||text;
    return "<a " + src + "  title='" + title + "' >" + text + "</a>";
  }).replace(/\((.*?)\)/gm, function(m,m1,index) {
      //当前为括号
    if(ret[index-1]=="\\"){
        return m;
    }
    if (/[-A-Za-z0-9+&@#\/%?=~_|!:,\.;]+[-A-Za-z0-9+&@#/%=~_|]/.test(m1)) {
      return "<a " + m1 + " >" + m1 + "</a>";
    }
    return m;
  })
}

function parseSlash(ret) {

  //.*?惰性匹配
  return ret.replace(/\*([^\s,\.。，‘’“”"'\?？\}\{]+)\*/gm, function(m, m1) {
            //当前为括号
    if(ret[index-1]=="\\"){
        return m;
    }
    
    return  "<i>" + m1+ "</i>"
  })
}

function parseBlod(ret) {
  //.*?惰性匹配
  return ret.replace(/_([^\s,\.。，‘’“”"'\?？\}\{]+)_/gm, function(m, m1) {
    return  "<strong>" + m1+ "</strong>"
  })
}

function parseDel(ret) {
  //.*?惰性匹配
  return ret.replace(/\~([^\s,\.。，‘’“”"'\?？\}\{]+)\~/gm, function(m, m1) {

    return  "<del>" + m1+ "</del>"
  })
}

//生成table
function parseTable(item) {
  var trs = item.str.split(/\n|\r/);
  var str = "";
  var tdClass = [];
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
      str += "<table><thead><tr>" + tdstr + "</tr></thead><tbody>\n"
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

  if (item.code.indexOf("col") != -1) {
    var strP = strs.join("\n").split(/\n[-]+\n[-]+\n/);
    var strLen = strP.length;
    var ret = "<ul class='col max" + strLen + "'>";
    strP.forEach(function(val) {
      ret += '<li class="' + item.code + '">' + val + '</li>'
    })
    return ret + "</ul>"
  } else {
    return '<pre> <code class="' + item.code + '">' + strs.join("\n") + '</code></pre>'
  }
}

//生成item
function parseList(item) {
  var strs = item.str.split(/\n/);
  var len = 0;
  var ret = "";
  strs.forEach(function(val) {
    if (/^\s*(\++)/.test(val)) {
      var plus = RegExp.$1;
      if (plus.length > len) {
        ret += "<ul>"
      } else if (plus.length < len) {
        ret += "</ul>"
      }
      ret += "<li>" + val.replace(plus, "") + "</li>"
      len = plus.length;
    }
  })
  if (ret) {
    ret = "</ul>"
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

var teststr = `
通用

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题


表格
| 项目 | 价格 | 数量 |
| --  | --:  | :--:  |
| 计算机 | $1600  |  5    |
| 手机     |  $12  |  12  |
| 管线     |    $1    |  234  |


\`\`\` css
.a{color:1}
\`\`\`

\`\`\` html
<div></div>
\`\`\`

\`\`\` javascript
 var a=1;
\`\`\`


规则不一样

新增

<!--浮动 布局 -->
\`\`\` col3

col1
-------
-------
col2
-------
-------
col3

\`\`\`

规则不一样

[超链接](https://www.baidu.com "超链接")
[^RUNOOB](https://www.baidu.com "btn-danger")
[^RUNOOB]
![美丽花儿alt](http://upload-images.jianshu.io/upload_images/7973237-581e2f071ef21881.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "美丽花儿title")

*斜体文本*
_粗体文本_
*_粗体文本_*
_*粗斜体文*_
~删除线~
~_*删除线粗斜体文*_~


分割线
***


无序列表使用星号(+)

+ 无序列表项 二
   ++ 无序列表项 sub
   ++ 无序列表项 sub
+ 无序列表项 3
+ 无序列表项 4

没有块规则

链接没有
<https://www.runoob.com>改位\\(https://www.runoob.com)

目前还不支持流程图的绘制

`

console.log(makedown(teststr))