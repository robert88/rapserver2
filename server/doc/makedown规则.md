### makedown使用说明

网上的makedown使用不是特别满意，为此定义如下规则的makedown
通用

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题


表格
| 项目 | 价格 | 数量 |
| --  | --:  | :--:  |
| 计算机 | $1600  |  5    |
| 手机     |  $12  |  12  |
| 管线     |    $1    |  234  |


``` css
.a{color:1}
```

``` html
<div></div>
```

``` javascript
 var a=1;
```


规则不一样

新增

<!--浮动 布局 -->
``` col3

col1
-------
-------
col2
-------
-------
col3

```

规则不一样

[超链接](https://www.baidu.com "超链接")
[^RUNOOB](https://www.baidu.com "btn-danger")
[^RUNOOB]
![美丽花儿alt](http://upload-images.jianshu.io/upload_images/7973237-581e2f071ef21881.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240 "美丽花儿title")

*斜体文本*
_粗体文本_
*_粗体文本_*
_*粗斜体文*_
~删除线~
~_*删除线粗斜体文*_~


分割线
***


无序列表使用星号(+)

+ 无序列表项 二
   ++ 无序列表项 sub
   ++ 无序列表项 sub
+ 无序列表项 3
+ 无序列表项 4

没有块规则

链接没有
<https://www.runoob.com>改位\\(https://www.runoob.com) (https://www.runoob.com)

目前还不支持流程图的绘制