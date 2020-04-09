### rapserver  双向通信

Sockie这个类提供了全双工的通信模式,并且和runner绑定一起用于共用restful接口

首先要对sockie协议要有了解

通过net模块来创建sockie的服务

``` javascript

const net = require('net');

this.server = net.createServer(null, this.middleHandle.bind(this));

``` 

对于http中间件主要是处理request和response，对于sockie中间件主要处理client(客户端对象)

每个客户端必须先创建一个sockie连接，然后发送建立连接的请求
服务器端建立连接之后就会创建一个client(客户端对象),这个时候客户端还是不可读

当client变为可读状态就可以读取buffer的数据
