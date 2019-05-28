
global.clearLocalRequireCache = function(file){
    var requireFile = localRequire(file,true);
    try{
        delete require.cache[require.resolve(requireFile)];
    }catch (e) {
      console.log(e.stack)
    }
}