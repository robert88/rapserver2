### rapserver  cluster

nodejs提供了cluster模块，多开nodejs进程

一般有几个cpu就开几个work，但是rapserver开启 cluster 的目的是为了远程重启服务

``` javascript

const numCPUs = require('os').cpus().length;

```

cluster执行都在同一个代码，那么他提供cluster.isMaster来判断是否是主进程

主进程可以监听所有worker的退出，这样就可以重启worker

创建worker的方式就是cluster.fork()，然后发送消息给这个worker.send("restart");

``` javascript
  if (cluster.isMaster) {
    cluster.on("exit", (worker, code, signal) => {
      //restart code process.exit(200)
      if (code == 200) {
        cluster.fork().send("restart");
      }
    });
  }
```