### rapserver  服务器监听主体

runner这个类提供了创建服务和处理通道流程的这个类

分别提供request管道，response管道，文件上传管道，错误处理管道

``` JavaScript

    this.inPipe = new AsyncSeriesWaterfallHook(["request", "response"]);
    this.outPipe = new AsyncSeriesWaterfallHook(["request", "response"]);
    this.update = new AsyncSeriesWaterfallHook(["file"]);
    this.error = new AsyncSeriesWaterfallHook(["err", "response", "comeFrom"]);

```

这里要说一下管道 AsyncSeriesWaterfallHook
这个是异步函数的处理集，通过回调方式把一个个hanlder处理函数串联起来，该函数取自于webpack核心代码AsyncSeriesWaterfallHook.js

有兴趣可以了解一下webpack的tapable

##### 通过http模块来创建服务

``` JavaScript
   this.server = https.createServer(this.middleware.bind(this)).listen(options.port || 3004, () => {
        this.status = "started";
        this.ready();
        console.log("server https run port " + (options.port || 3004));
      });

```

#### 异常捕获

异常分为3种异常，分别是同步执行异常，异步执行的异常，还有进程异常

同步异常可以通过 try catch来捕获
``` JavaScript
  //捕获同步异常
      try {
        this.handler(request, response);
      } catch (err) {
        this.error.callAsync(err, response, "trycatch", () => {
          err = null;
          d = null;
        });
      }

```

异步执行的异常，主要是通过domain模块来捕获

``` JavaScript

  const domain = require('domain');


    let d = domain.create();

    //捕获异步异常
    d.on('error', (err) => {

        //handler sync error

    });

    d.run(() => {

     //handler pipe

    });

```

进程异常,进程错误会导致整个进程被回收销毁，即系统挂掉了，添加捕获可以防止系统停止
这里runnerStack是为了更好地收集这些错误

``` JavaScript

process.on('uncaughtException', function(err) {
  rap.runnerStack && rap.runnerStack.forEach(runner => {
    runner.responseStack.forEach((response) => {
      runner.error.callAsync(err, response, "uncaughtException", () => {
        runner.clear();
      });
    })
  });
  console.log(err.stack);
});


```
