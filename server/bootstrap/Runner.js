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
        this.error = new AsyncSeriesWaterfallHook(["err","response","comeFrom"]);

        this.error.tapAsync({
            name:"normalErrorHandle",
            fn(err,response,comeFrom){
                //默认response
                if(response&&response.finished==false){
                    response.end(comeFrom+":"+err&&err.message);
                }
            }

        })

        //创建http服务
        this.readyStack = [];
        this.httpStatus = "ready";
        this.server = http.createServer(this.middleware.bind(this)).listen(options.port||3003,()=>{
            this.httpStatus = "started";
            this.ready();
            console.log("server http run port "+(options.port||3003));
        });


        //创建https服务
        if(options.https){
            this.HttpsReadyStack = [];
            this.httpsStatus = "ready";
            this.serverHttps =  http.createServer(this.middleware.bind(this)).listen(options.https.port||3004,()=>{
                this.httpsStatus = "started";
                this.HttpsReady();
                console.log("server https run port "+(options.https.port||3003));
            });
        }

        rap.runnerStack.push(this);
    }
    
    ready(fn){
        if(typeof fn=="function"){
            this.httpReadyStack.push(fn);
        }
        if(this.httpStatus=="started"){
            this.httpReadyStack.forEach((fn)=>{
                fn();
            });
            this.httpReadyStack.length = 0
        }
    }

    HttpsReady(fn){
        if( !this.serverHttps ){
            return;
        }
        if(typeof fn=="function"){
            this.httpsReadyStack.push(fn);
        }
        if(this.httpsStatus=="started"){
            this.httpsReadyStack.forEach((fn)=>{
                fn();
            });
            this.httpsReadyStack.length = 0
        }
    }

    close(){
        this.clear();
        this.server.close();
        if(this.serverHttps){
            this.serverHttps.close();
        }
        this.pipe.taps=[];
        this.pipe._resetCompilation();
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

        //捕获异步异常
        d.on('error',  (err) =>{

            this.error.callAsync(err,response, "domainErrorEvent",()=>{
                d = null;
            });

        });

        d.run(()=>{
            //捕获同步异常
            try {
                this.handler(request,response);
            } catch (err) {
                this.error.callAsync(err,response, "trycatch",()=>{
                    err = null;
                    d = null;
                });
            }
        });
    

    }

    clear(filter){
        let ret = [];
        this.responseStack.forEach(function(response){
			//filter can return false aways responseCache will empty
            if (typeof filter == "function" && filter(response) === false) {
                return;
            }
            if(response&&response.finished==false){
                ret.push(response);
            }
        });
        this.responseStack = ret;
        ret = null;
    }
    //处理请求
    handler(request,response){

        this.pipe.callAsync(request,response,(err,request,response)=>{
            if(err){
                this.error(err,response,"pipeException");
            //默认response
            }else if(request&&response&&response.finished==false){
                response.end("helloworld");
            }
        });

    }
}

//服务器挂了
process.on('uncaughtException', function (err) {
    rap.runnerStack&&rap.runnerStack.forEach(runner=>{
        runner.responseStack.forEach((response)=>{
            runner.error.callAsync(err, response, "uncaughtException",()=>{
                runner.clear();
            });
        })
    });
    rap.runnerStack = null;
});
 
