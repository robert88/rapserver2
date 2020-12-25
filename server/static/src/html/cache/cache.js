;;
(function($, parseTeample, socketSend) {

  $.floatHeight = RBT.floatHeight;
  $.ajax = RBT.ajax;


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
    var staticMap = {}
    // //获取
    // $.ajax({
    //   url: "/rapserver/cache/get",
    //   dataType: "json",
    //   success: function(ret) {
    //     staticMap = ret;
    //     updateRootInfo($right, ret)
    //   },
    //   error: function(code, xhr) {
    //     $.tips(xhr.responseText, "error");
    //   }
    // });

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
        var mapid = formParam.path + formParam.type
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



})(RBT.dom, RBT.parseTeample, RBT.socketSend);