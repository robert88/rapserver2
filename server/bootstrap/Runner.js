const http = require("http");
const https = require("https");
const domain = require('domain');

const AsyncSeriesWaterfallHook = localRequire("@/server/lib/node_modules/tapable/AsyncSeriesWaterfallHook.js");

//初始化必要的全局变量

 global.rap =  global.rap || {};

rap.runnerStack = [];

module.exports = class Runner{

    constructor(options){
        //存储未完成的response
        this.responseStack = [];

        options = options || {};

        this.pipe = new AsyncSeriesWaterfallHook(["request","response"]);

        //默认response
        this.pipe.tap({
            stage:-10,
            name:"responseEnd",
            //如果可以传递到这里，那么就输出helloworld
            fn(request,response){
                if(response){
                    response.end("helloworld");
                }
            }
        });

        //创建http服务
        this.server = http.createServer(this.middleware.bind(this)).listen(options.port||80);

        //创建https服务
        if(options.https){
            this.serverHttps =  http.createServer(this.middleware.bind(this)).listen(options.https.port||443);
        }

        rap.runnerStack.push(this);
    }
    
    //处理error
    error(err,response,from){
        console.error(err&&err.message,"from",from);
    }
    
    middleware(request,response){
        //清除无用的response
        this.clear();
        this.responseStack.push(response);
        this.try(request,response)
    }
    //捕获异步异常
    try(request,response){

        let d = domain.create();

        d.run(()=>{
            //捕获同步异常
            try {
                this.handler(request,response);
                throw new Error();
            } catch (err) {
                this.error(err, response, "trycatch");
                err = null;
                d = null;
            }
        });
    
        //捕获异步异常
        d.on('error',  (err) =>{
            this.error(err, response, "domainErrorEvent");
            d = null;
        });
    }

    clear(filter){
        let ret = [];
        this.responseStack.forEach(function(response){
			//filter can return false aways responseCache will empty
            if (typeof filter == "function" && filter(response) === false) {
                return;
            }
            ret.push(response);
        });
        this.responseStack = ret;
        ret = null;
    }
    //处理请求
    handler(request,response){

        this.pipe.callAsync(request,response);

    }
}

//服务器挂了
process.on('uncaughtException', function (err) {
    rap.runnerStack&&rap.runnerStack.forEach(runner=>{
        runner.error(err, runner.response, "uncaughtException");
        runner.clear();
    });
    rap.runnerStack = null;
});

