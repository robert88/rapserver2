/**
 * 清除干扰
 * */
rap.parse.wrap = function(reg, id, orgHtml, wrap) {
  var arr = [];
  orgHtml = orgHtml.replace(reg, function(val) {
    arr.push(val);
    return id + (arr.length - 1)
  });

  //同步和异步一起
  orgHtml = wrap(orgHtml,function(html){
    arr.forEach(function(str, idx) {
      html = html.replace(new RegExp(id + idx), str);
    });
    return html
  });

  arr.forEach(function(str, idx) {
    orgHtml = orgHtml.replace(new RegExp(id + idx), str);
  });

  return orgHtml;
}


/**
 * 清除注释的干扰/<!--((?!<!--).)*?-->/gmi
 * */
rap.parse.clearNoteWrap = function(orgHtml, wrap) {
  //过滤掉注释
  var noteReg = /<!--[\u0000-\uFFFF]*?-->/gmi;
  var id = "______RAPREPLACENOTETAG______"
  return rap.parse.wrap(noteReg,id,orgHtml, wrap)
}

