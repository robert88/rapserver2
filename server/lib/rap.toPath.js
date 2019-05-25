    //统一路径格式
    rap.toPath = (path)=>{
        if(!path|| /^(http:|https:|\/\/|\\\\)/.test(path)){
            return path;
        }
        return path.replace(/(\/|\\)+/g,"/").replace(/(\/|\\)$/,"");
    }