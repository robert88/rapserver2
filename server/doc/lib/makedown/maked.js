
var tagMap = {
    r: "hr",
    b: "strong",
    s: "del",
    ib: "i,strong"
}
//入口
var makedown = function (str) {
    if (!str) {
        return "";
    }
    var strs = str.split(/\n|\r/);
    var token = [];
    for (var i = 0; i < strs.length; i++) {
        var s = htmlToString(strs[i]);
        var rule = /^\s*(.*)\s/.exec(s);
        var tag;
        rule = rule && rule[1]

        if (/^:(\w+)$/.test(rule)) {
            tag = tagMap[RegExp.$1] || RegExp.$1;
            token.push({ str: s.replace(rule, ""), className: "tl", type: "tag", tag: tag });
        } else if (/^:(\w+):$/.test(rule)) {
            tag = tagMap[RegExp.$1] || RegExp.$1;
            token.push({ str: s.replace(rule, ""), className: "tc", type: "tag", tag: tag });
        } else if (/^(\w+):$/.test(rule)) {
            tag = tagMap[RegExp.$1] || RegExp.$1;
            token.push({ str: s.replace(rule, ""), className: "tr", type: "tag", tag: tag });
        } else if (/^(#+)$/.test(rule)) {
            token.push({ str: s.replace(rule, ""), type: "tag", tag: "H" + rule.length });
        } else if (/^\+/.test(rule)) {
            var endInfo = findEnd(strs, i, /^[^\+]/, true);
            token.push({ str: endInfo.str, type: "list" });
            i = endInfo.index;
        } else if (/^\s*```\s*(\w*)$/.test(s)) {
            var code = RegExp.$1;
            var endInfo = findEnd(strs, i, /^\s*```/, false);
            token.push({ str: endInfo.str, type: "code", code: code });
            i = endInfo.index;
        } else if (/^\|/.test(s)) {
            var endInfo = findEnd(strs, i, /^[^\|]/, true);
            token.push({ str: endInfo.str, type: "table" });
            i = endInfo.index;
        } else {
            token.push({ str: s, type: "tag", tag: "p" })
        }

    }

    var tokenStr = [];
    token.forEach(item => {
        switch (item.type) {
            case "table":
                tokenStr.push(parseTable(item));
                break;
            case "tag":
                tokenStr.push(parseTag(item));
                break;
            case "code":
                tokenStr.push(parseCode(item));
                break;
            case "list":
                tokenStr.push(parseList(item));
                break;
        }
    })
    return tokenStr.join("\n")
}

//生成table
function parseTable(item) {
    var trs = item.str.split(/\n|\r/);
    var str = "";
    trs.forEach(function (tr, i) {
        var tds = tr.split(/\|/);
        var tdstr = "";
        // 去掉两边
        tds = tds.slice(1, tds.length - 1);
        var len = 0;
        tds.forEach(function (td, j) {
            if (td == "") {
                len++;
            } else {
                if (i == 0) {
                    if (len) {
                        tdstr += "<th colspan='"+len+"'>" + td + "</th>"
                    } else {
                        tdstr += "<th>" + td + "</th>"
                    }

                } else {
                    if (len) {
                        tdstr += "<td colspan='"+len+"'>" + td + "</td>"
                    } else {
                        tdstr += "<td>" + td + "</td>"
                    }
                }
                len = 0;
            }
        })
        if (i == 0) {
            str += "<table><thead><tr>" + tdstr + "</tr></thead><tbody>"
        }else{
            str += "<tr>" + tdstr + "</tr>"
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
    tags.forEach(function (tag) {
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
        strP.forEach(function (val) {
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
    strs.forEach(function (val) {
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
    if (reg.test(strs[endInfo.index].replace(/^\s+|\s+$/, ""))) {
        if (!include) {
            endInfo.str = endInfo.str + "\n" + htmlToString(strs[endInfo.index]);
        }
        return endInfo
    }
    endInfo.str = endInfo.str + "\n" + htmlToString(strs[endInfo.index]);
    return findEnd(strs, endInfo.index, reg, include, endInfo)

}

var teststr = `
i: 靠右斜体
:i: 居中斜体
:i 斜体
:b 粗体
:ib 加粗斜体
:s 删除线

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

\`\`\` css
.a{color:1}
\`\`\`

\`\`\` html
<div></div>
\`\`\`

\`\`\` javascript
 var a=1;
\`\`\`

 # 一级标题
 ## 二级标题
 ### 三级标题
 #### 四级标题
 ##### 五级标题
 ###### 六级标题


 这是[超链接](https://www.baidu.com "超链接")

自动链接
 (address@example.com)

 跳转到[目录](#index)

+ 无序列表项 二
    ++ 无序列表项 sub
    ++ 无序列表项 sub
+ 无序列表项 3
+ 无序列表项 4

![美丽花儿](http://upload-images.jianshu.io/upload_images/7973237-581e2f071ef21881.jpg?imageMogr2/auto-orient/
strip%7CimageView2/2/w/1240 "美丽花儿")

表格
| 项目 | 价格 | 数量 |
| --  | --:  | :--:  |
| 计算机 | $1600  |  5    |
| 手机     |  $12  |  12  |
| 管线     |    $1    |  234  |`

console.log(makedown(teststr))

