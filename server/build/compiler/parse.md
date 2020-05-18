
    ### 解析模板文件

    模板就是代码片段分割在不同的html，方便管理和复用html代码结构

    依赖rap如下模板

    1、rap.system

        提供文件的读写
    
    2、rap.extend

        提供JavaScript对象的复制方式，如排除数组的深度拷贝

    提供如下api

    ###### rap.parse.byHtmlFile

        (entryFile, config, parentData, parentRelativeWatch, unique)

        entryFile：为模板html文件，一般是存在的[后缀文件](#suffix)，如果没有后缀文件那就是去掉后缀文件

        config：
        ```
        {
            suffix:"cn",//模板文件和数据文件的后缀文件,
            resolve:function //将模板里面使用到的路径转为实际物理地址
        }
        ```
        parentData ： 入口数据，可以在调用的地方加入数据，这个数据会深度合并数据文件的数据

        parentRelativeWatch：监听文件物理地址列表，当前编译的文件列表下收集所有依赖，树形结构

        unique：防止递归循环解析

    ###### rap.parse.byHtml

    解析对象为html代码

#### 后缀文件

    如参数的后缀为cn,那么html文件为xxx.cn.html,数据文件为xxx.cn.js

#### 使用slot功能 
    
    用于引用公共的头底部

目标页面/src/B.html
```
<useSlot name="root" src="a.html">
   ---- B.html ----
</useSlot>

```

slot页面 a.html
```
    ---- a.html -----
    <slot name="root"></slot>
    ---- a.html -----

```

编译得到/dist/B.html

```
    ---- a.html -----
    ---- B.html ----
    ---- a.html -----

```