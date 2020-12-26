
global.clearLocalRequireCache = function(file){
    var requireFile = localRequire(file,true);
    try{
      var cache = require.cache[require.resolve(requireFile)]
      if(cache){
        //内部销毁
        if(typeof cache.exports._destroy=="function"){
          cache.exports._destroy();
        }
        delete require.cache[require.resolve(requireFile)];
      }
    }catch (e) {
      console.log(e.stack)
    }
}