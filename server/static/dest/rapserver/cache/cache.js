;
;

(function ($, parseTeample, socketSend) {
  $.floatHeight = RBT.floatHeight;
  $.ajax = RBT.ajax; //更新显示的ui

  function updateRootInfo($rootInfo, ret) {
    var orgHtml = '[[#each obj]]<li ><div class="rootId">[[$index]]</div><div  class="rootPath">[[$value]]</div>[[#if ($index!=\'rapserver\')]]<a class="J-delPath fa-times" title="可删除" data-id="[[$index]]"></a>[[#endIf]]</li>[[#endEach]]';
    $rootInfo.html('<ul>{0}</ul>'.tpl(parseTeample(orgHtml, ret)));

    for (var key in ret) {
      setCache(key, ret[key]);
    }
  }
  /**
   * 根目录
   */


  function initRootInfo() {
    var $rootInfo = $(".cache-static-block");
    var $right = $rootInfo.find(".right .content");
    var staticMap = {}; // //获取
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
    // 删除

    $rootInfo.on("click", ".J-delPath", function () {
      $.ajax({
        url: "/rapserver/root/del",
        data: {
          rootId: $(this).data("id")
        },
        dataType: "json",
        success: function success(ret) {
          staticMap = ret;
          updateRootInfo($right, ret);
          $.tips("删除成功", "success", 1000);
        },
        error: function error(code, xhr) {
          $.tips(xhr.responseText, "error");
        }
      });
    }); //添加

    $rootInfo.find(".ipt-form").validForm({
      focus: function focus($form) {
        $form.find(".form-tips-error").hide();
      },
      success: function success($btn, $form) {
        var formParam = {
          path: $form.find("[name='path']").val(),
          rootId: $form.find("[name='rootId']").val()
        };

        if (staticMap[formParam.rootId]) {
          $.tips("已添加过", "warn");
          return;
        }

        $.ajax({
          url: "/rapserver/root/add",
          data: formParam,
          type: "post",
          dataType: "json",
          success: function success(ret) {
            updateRootInfo($right, ret);
            formParam = null;
            $.tips("添加成功", "success", 1000);
          },
          error: function error(code, xhr) {
            $.tips(xhr.responseText, "error");
          }
        });
      }
    });
  }
  /**
   * 填充表单数据
   */


  initRootInfo();
})(RBT.dom, RBT.parseTeample, RBT.socketSend);