const http = require("http");
const https = require("https");
const domain = require('domain');

//初始化必要的全局变量
require("./enviroment.js")

class Runner{

    constructor(options){

        this.responseStack = [];


        //创建http服务
        this.server = http.createServer(this.middleware.bind(this)).listen(options.port||80);

        //创建https服务
        if(options.https){
            http.createServer(this.middleware).listen(options.https.port||443);
        }

        http.get({
            hostname: 'localhost',
            port: options.port||80,
            path: '/',
            agent: false  // 仅为此一个请求创建一个新代理。
          }, (res) => {
            // 用响应做些事情。
            res.end("ok")
          });
    }
    
    //处理error
    error(err, response, from){
      if(typeof err=="object"){
          if(err.stack){
              let code = rap.error(err.stack);
          }
      }

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
    //处理请求
    handler(request,response){
    
        requestFilter(req, function (request) {
    
            handleResponse(request, response);

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
}

process.on('uncaughtException', function (err) {
 console.log(err)
});

new Runner({port:1026})