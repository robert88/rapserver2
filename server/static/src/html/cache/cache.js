;;
(function($, parseTeample, socketSend) {

  $.floatHeight = RBT.floatHeight;
  $.ajax = RBT.ajax;

console.log("clearSuccess")

  //更新显示的ui
  function updateRootInfo($rootInfo, ret) {
    var orgHtml = '[[#each obj]]<li ><span class="type">[[$value.type]]</span><span  class="path">[[$value.path]]</span><span  class="time">[[$value.time.format(\'yy/MM/dd hh:mm:ss\')]]</span></li>[[#endEach]]';
    $rootInfo.html('<ul>{0}</ul>'.tpl(parseTeample(orgHtml, ret)));
  }

  /**
   * 根目录
   */
  function initRootInfo() {
    var $rootInfo = $(".cache-static-block");
    var $right = $rootInfo.find(".right .content");
    var staticMap = {};
    var list = getCache();
    list.forEach(item=>{
      staticMap[item[0]+item[1]] = staticMap[item[0]+item[1]] || [];
      staticMap[item[0]+item[1]].push(item[2]*1)
    });
    //添加
    $rootInfo.find(".ipt-form").validForm({
      focus: function($form) {
        $form.find(".form-tips-error").hide();
      },
      success: function($btn, $form) {

        var formParam = {
          path: $form.find("[name='path']").val(),
          type: $form.find("[name='type']").val(),
          time: new Date().getTime()
        }
        var mapid = formParam.type+ formParam.path 
        //时间是按小排到大
        if (staticMap[mapid] && formParam - staticMap[mapid].slice(-1)[0] < 10000) {
          $.tips("添加频繁", "warn");
          return
        }
        staticMap[mapid] = staticMap[mapid] || [];
        staticMap[mapid].push(formParam.time);
        $.ajax({
          url: "/rapserver/root/clearCache",
          data: formParam,
          type: "post",
          dataType: "json",
          success: function(ret) {
            setCache(formParam);
            updateRootInfo($right, ret)
            formParam = null;
            $.tips("添加成功", "success", 1000);
          },
          error: function(code, xhr) {
            $.tips(xhr.responseText, "error");
          }
        })
      }
    });
  }

  /**
   * 填充表单数据
   */
  initRootInfo();

  /**
   * 设置更新cookie
   */
  var clearList = [];

  function setCache(obj) {
    clearList.push([obj.type, obj.path, obj.time]);
    clearList = clearList.slice(-30)
    localStorage.setItem("clearCache", JSON.stringify(clearList));
  }

  function getCache() {
    try {
      clearList = JSON.parse(localStorage.getItem("clearCache"));
    } catch (error) {
      clearList = [];
    }
    return clearList||[];
  }

})(RBT.dom, RBT.parseTeample, RBT.socketSend);