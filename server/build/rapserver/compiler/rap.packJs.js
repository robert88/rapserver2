const {resolve} = require("@/rap.alias.js");
const wake = require("@/lib/rap.filesystem.js");
const {parseRequire} = require("@/compiler/rap.parse.js");

/*处理require js*/
function handleRequireJs(code,toServerPath,requireCash) {
    var requireArr = parseRequire(code);
    requireCash = requireCash||{};
    requireArr.forEach(function (requireInfo) {
        var src = toServerPath(requireInfo.src);
        var index;
        if(src && wake.isExist(src)) {
            if(!requireCash[src]){
                index = recordRequireIndex(src,requireCash);
                var childCode =  wake.readData(src);
                childCode = wrapFunction(childCode,index);
                childCode = handleRequireJs(childCode,toServerPath,requireCash);
                requireCash[src].raw = childCode;
            }else{
                index = requireCash[src].index;
            }
            code = replaceInnerRequire(code,requireInfo.template,index);
        }else{
            console.error("error not find require js path",src);
        }
    });
    return code;
}
/*封装成一个函数*/
function wrapFunction(code){
    return "function(module,innerRequire,exports){\n{0}\n}".tpl(code);
}
/*替换require*/
function replaceInnerRequire(orgCode, replaceCode, index){
    return orgCode.replace(replaceCode, "innerRequire({0})".tpl(index));
}
/*
 *将require记录到一个对象上,可以防止循环require
 *
 */
function recordRequireIndex(requireUrl,requireCash) {

    //过滤重复require
    if (!requireCash[requireUrl] || requireCash[requireUrl].index==null ) {


        requireCash.count = requireCash.count||0;

        //记录模块索引
        requireCash[requireUrl] = {index: requireCash.count};

        requireCash.count++;

    }

    return requireCash[requireUrl].index;

}
/***
*打包js
 * */
function packJs(code,toServerPath,packInfo){
    var requireArr = parseRequire(code);
    if(requireArr.length==0){
        return code;
    }
    packInfo = packInfo||{};
    var packArr = [];
    code = handleRequireJs(code,toServerPath||resolve,packInfo);
    delete packInfo.count;
    for(var src in packInfo){
        packArr[packInfo[src].index] = packInfo[src].raw;
    }
    return wrapCode(code,packArr)
}

function wrapCode(code,modules){
    return ";(function(){\nvar innerArgument = arguments;\nvar innerModule = {};\nvar innerRequire = function(index){\nif(!innerArgument[index].called){\nvar module={};\ninnerArgument[index].called=1;\ninnerArgument[index].calling=1;\ninnerArgument[index].apply(this,[module,innerRequire].concat(arguments));\ninnerArgument[index].calling=0;\n;innerModule[index]=Object.assign({},module&&module.exports);\n}\nif(innerArgument[index].calling){console.error('cricle require')}\n return innerModule[index];\n };\n{0}\n})({1});".tpl(code,modules.join(",\n/**/\n"))
}

exports = module.exports ={
    packJs:packJs
};
