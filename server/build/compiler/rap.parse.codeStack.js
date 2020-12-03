const URL = require("url");

/**
 * html：提取html资源文件
 * codeStack: 对应的资源列表
 * config 路径配置
 * extname :后缀名称
 * templatePath :对应html文件
 * options参数
 * */

var uuid = 0; //保证每次进来这个function都有一个唯一的id
module.exports = function(tags, config, extname, templatePath, callback) {

  var groupMap = {}; //用于收集合并的代码
  var uniqueStack = []; //用于去重
  var codeStack = [];
  uuid++;

  tags.forEach(function(tag, idx) {
    var stack = {};
    stack.url = tag.attrs.src || tag.attrs.href; //外部引用
    stack.sort = tag.attrs.sort; //是否排序
    stack.build = tag.attrs.build == "false" ? false : true; //定了了false就不需要编译
    stack.id = tag.attrs.id; //防止去重
    stack.content = tag.innerHTML && tag.innerHTML.trim(); //是否内联代码,考虑还有单标签
    stack.uuid = "__RAP" + idx + "_" + uuid + "REPLACE__"; //唯一的id;
    stack.template = tag.template; //html中的位置
    stack.templatePath = templatePath; //html文件路径
    stack.location = tag.attrs.location; //需要设置的位置
    var group = tag.attrs.group; //合并打包

    //判断一下哪种类型
    if (stack.url && !stack.content) {
      if ((/^https?:/i.test(stack.url) || /^\/\//i.test(stack.url))) {
        stack.codeType = "remotefile";
      } else {
        stack.codeType = "file";
      }

      stack.param = URL.parse(stack.url.trim(), true).query || {}; //必须提前解析param,URL.parse第二个参数为true才能保证输出的是对象
      stack.url = stack.url.split("?")[0].trim().toURI();

      if (!/\.\w+$/.test(stack.url)) { //保证带有后缀
        stack.url = stack.url + extname;
      }

      //代码重复了
      if (~uniqueStack.indexOf(stack.url)) {
        stack.codeType = "igrone";
      } else {
        uniqueStack.push(stack.url); //去重
      }

    } else if (!stack.url && stack.content) {
      stack.codeType = "code";

      //代码重复了
      if (~uniqueStack.indexOf(stack.content)) {
        stack.codeType = "igrone";
      } else {
        uniqueStack.push(stack.content); //去重
      }

    } else {
      stack.codeType = "igrone";
    }

    //处理合并打包
    if (group) {
      var dirPath = config.output(config.templatePath, group, extname).toURI();
      if (!groupMap[dirPath]) {
        groupMap[dirPath] = stack; //第一生成一个groupmap来记录同group的资源
        stack.group = true;
        stack.groupStack = [];
        if (stack.codeType == "igrone" || stack.codeType == "remotefile") { //合并打包需要本地代码和内联代码
          console.waring("group srouce unknow or remotefile");
          stack.codeType = "igrone"
        } else {
          stack.groupStack.push({ url: stack.url, code: stack.content })
          stack.codeType = "file";
        }

        if (!/\.\w+$/.test(group)) { //保证带有后缀
          group = group + extname;
        }

        stack.url = group //保证带有后缀
      } else {
        groupMap[dirPath].groupStack.push({ url: stack.url, code: stack.content });
        stack.codeType = "igrone"; //当前需要合并到第一个group上，当前位置失效
      }
    }

    codeStack.push(stack);

  });


  groupMap = null;
  uniqueStack = null;
  //需要group收集完闭
  codeStack.forEach((stack, idx) => {
    callback(stack, idx, codeStack.length);
  })

}