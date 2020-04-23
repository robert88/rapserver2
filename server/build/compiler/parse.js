function parseAttrs(attrArr, obj) {
  if (attrArr) {
    var attrs = {};
    attrArr.forEach(function(attrStr) {
      var splitAttr = attrStr.split("=");
      var key = splitAttr[0].trim()
      if (key) {
        attrs[key] = splitAttr[1].trim().replace(/^'|^"|'$|"$/g, "");
        if (key == "src" || key == "href") {
          attrs["params"] = attrs[key].split("?")[1];
          attrs[key] = attrs[key].split("?")[0];
        }
      }
    });
    obj.attrs = attrs;
  }
}

//去掉注释
function getNoteArr(fileData) {

  var noteReg = /<!--[\u0000-\uFFFF]*?-->/gm;
  var noteAttr = fileData.match(noteReg);
  if (noteAttr) {
    noteAttr.forEach(function(note, idx) {
      fileData = fileData.replace(note, "<!--" + idx + "-->");
    })
  }
  return [fileData, noteAttr];
}
//还原注释
function replaceNote(innerHTML, noteAttr) {
  var reg = /<!--[\u0000-\uFFFF]*?-->/gm;
  var orgArr = innerHTML.match(reg);
  if (orgArr) {
    orgArr.forEach(function(item) {
      var index = item.replace(/<!--([\u0000-\uFFFF]*?)-->/gm, "$1") * 1 || 0;
      innerHTML = innerHTML.replace(item, noteAttr[index])
    })
  }
  return innerHTML;
}

//提取params和修正src
function parseSrc(obj, requireCode, importReg) {
  var src = requireCode.replace(importReg, "$1");
  src = src && src.trim().replace(/^'|^"|'$|"$/g, "") || "";
  obj.src = src.split("?")[0];
  obj.params = src.split("?")[1];
}

function parseTagByReg(tag,regStr,attrRegStr,fileData,single){
  var arr = [];
  if (/^\w+$/.test(tag)) {
    var reg = new RegExp(regStr, "gmi");

    var noteInfo = getNoteArr(fileData);

    fileData = noteInfo[0];
    //替代match，来获取mapindex
    fileData.replace(reg, function(tagStr) {

      var obj = { template: replaceNote(tagStr, noteInfo[1]), attrs: {} };
      obj.startTag = tagStr.replace(new RegExp(regStr, "i"), "$1");
      if (!single) {
        obj.innerHTML = replaceNote(tagStr.replace(new RegExp(regStr, "i"), "$2"), noteInfo[1]);

        obj.endTag = "</" + tag + ">";
      }
      var attrStrOrg = tagStr.replace(new RegExp(attrRegStr, "i"), "$1")
      var attrArr1 = attrStrOrg.match(/[^='"\s]+="[^"]+"/g) || [];
      var attrArr2 = attrStrOrg.match(/[^='"\s]+='[^']+'/g) || [];
      var attrArr3 = attrStrOrg.match(/[^='"\s]+=[^"'\s]+/g) || [];
      var attrArr = attrArr1.concat(attrArr2).concat(attrArr3);
      parseAttrs(attrArr, obj);
      obj.mapIndex = arguments[arguments.length - 2];
      arr.push(obj);
    });
  } else {
    console.error("tag must is word");
  }
  return arr;
}

exports = module.exports = {
  //只能解析单个tag
  parseTag(tag, fileData, single) {

    var regStr, attrRegStr;
    if (single) {
      regStr = "(<" + tag + "[^>]*>)";
      attrRegStr = "<" + tag + "([^>]*)>";
    } else {
      regStr = "(<" + tag + "[^>]*>)([\\u0000-\\uFFFF]*?)<\\/" + tag + ">";
      attrRegStr = "<" + tag + "([^>]*)>([\\u0000-\\uFFFF]*?)<\\/" + tag + ">";
    }

    return parseTagByReg(tag,regStr,attrRegStr,fileData,single);
  },
  //闭合标签
  parseTree(tag, html,level,parenttags) {

     level=level||{count:0}

    if (!/^\w+$/.test(tag)) {
      console.error("tag must is word");
      return parenttags
    }
    regStr = "(<" + tag + "[^>]*>)(((?!<" + tag + ").)*?)<\\/" + tag + ">";
    attrRegStr = "<" + tag + "([^>]*)>(((?!<" + tag + ").)*?)<\\/" + tag + ">";
    var tags =parseTagByReg(tag,regStr,attrRegStr,html,false);

    if(!parenttags){
      parenttags = tags
    }else{
      tags.forEach((t,idx)=>{
        t.orgTemplate = t.template;//保留之前的template
        t.child = t.child ||[];
        parenttags.forEach((ptag,pindex)=>{
          if(~t.template.indexOf("__TAG__"+tag+pindex+(level.count)+"__")){
            t.child.push(parenttags[pindex]);
            t.template = t.template.replace("__TAG__"+tag+pindex+(level.count)+"__",ptag.template);
            t.innerHTML = t.innerHTML.replace("__TAG__"+tag+pindex+(level.count)+"__",ptag.template);
            parenttags[pindex] = t;//父类取代
          }
        })
      })
    }


    if(tags.length){
      level.count++;
      tags.forEach((t,idx)=>{
        t.orgTemplate = t.orgTemplate||t.template;//保留之前的template
        html = html.replace(t.orgTemplate,"__TAG__"+tag+idx+(level.count)+"__");
      })
      this.parseTree(tag,html,level,parenttags);
    }
    var newArr=[];
    parenttags.forEach(p=>{
      if(newArr.indexOf(p)==-1){
        newArr.push(p);
      }
    })
    return newArr;
  },

  parseRequire(code) {
    var arr = [];
    if (!code) {
      return arr;
    }
    var importReg = /require\s*\(\s*"?'?\s*([^"']+)\s*"?'?\)\s*/gmi;

    //匹配多个require("/dfsdfsf/sa.js")
    var requireCodes = code.match(importReg) || [];

    requireCodes.forEach(function(requireCode) {
      var obj = {};
      importReg.lastIndex = 0;
      obj.template = requireCode;
      parseSrc(obj, requireCode, importReg);
      arr.push(obj);
    });
    return arr;
  },
  parseCssImport(code) {
    var arr = [];
    if (!code) {
      return arr;
    }
    var importReg = /import\s*\(\s*([^()]+)\s*\)\s*/gmi;

    //匹配多个require("/dfsdfsf/sa.js")
    var requireCodes = code.match(importReg) || [];

    requireCodes.forEach(function(requireCode) {
      var obj = {};
      importReg.lastIndex = 0;
      obj.template = requireCode;
      //得到src和params
      parseSrc(obj, requireCode, importReg);
      arr.push(obj);
    });
    return arr;
  },
  parseCssBackground(code) {
    var arr = [];
    if (!code) {
      return arr;
    }
    var bgReg = /\s*url\(\s*([^()]+)\s*\)\s*/gmi;

    //匹配多个url("/dfsdfsf/sa.js")
    var requireCodes = code.match(bgReg) || [];
    requireCodes.forEach(function(requireCode) {
      var obj = {};
      bgReg.lastIndex = 0;
      obj.template = requireCode;
      parseSrc(obj, requireCode, bgReg);
      arr.push(obj);
    });
    return arr;
  },
  clearNoteTag(tag, fileData, single) {
    var regStr;
    if (single) {
      regStr = "(<" + tag + "[^>]*>)";
    } else {
      regStr = "(<" + tag + "[^>]*>)([\\u0000-\\uFFFF]*?)<\\/" + tag + ">";
    }
    var noteReg = /<!--[\u0000-\uFFFF]*?-->/gmi;

    var reg = new RegExp(regStr, "gmi");

    var replaceData = fileData.replace(noteReg, function(val) {
      return val.replace(reg, "")
    });
    return replaceData;
  }
}