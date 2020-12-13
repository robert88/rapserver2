;
;

(function ($, parseTeample, socketSend) {
  $.floatHeight = RBT.floatHeight;
  $.ajax = RBT.ajax; //同行等高
  //   $.floatHeight(".index-content", ".index-static-item");
  //更新显示的ui

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
    var $rootInfo = $(".index-static-block");
    var $right = $rootInfo.find(".right .content");
    var staticMap = {}; //获取

    $.ajax({
      url: "/rapserver/root/get",
      dataType: "json",
      success: function success(ret) {
        staticMap = ret;
        updateRootInfo($right, ret);
      },
      error: function error(code, xhr) {
        $.tips(xhr.responseText, "error");
      }
    }); // 删除

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
   * 设置更新cookie
   */


  var setLocalStorageTimer;

  function setCache(key, value) {
    var staticPathMap = parseStaticMap();
    staticPathMap[key] = value;
    localStorage.setItem("staticPathMap", JSON.stringify(staticPathMap));
    clearTimeout(setLocalStorageTimer);
    setLocalStorageTimer = setTimeout(function () {
      initFormCache();
    }, 200);
  }
  /**
   * 导入cookie
   */


  function initFormCache() {
    var staticPathMap = parseStaticMap();
    $("#staticRootId").downMenu().add(staticPathMap);
    $("#staticRootId").off("change").on("change", function () {
      var key = $(this).val();

      if (staticPathMap[key]) {
        $("#staticRootPath").val(staticPathMap[key]).trigger("change");
      }
    });
  }
  /**
   * 解析cookie里面的值
   */


  function parseStaticMap() {
    var staticPathMap = localStorage.getItem("staticPathMap");

    if (!staticPathMap) {
      staticPathMap = {};
    } else {
      try {
        staticPathMap = JSON.parse(staticPathMap);
      } catch (e) {}
    }

    return staticPathMap;
  }
  /**
   * 得到240s的数组，每个相隔40s
   * */


  function getXaxis() {
    var zeroTime = new Date().setHours(0, 0, 0, 0);
    var currentM = Math.floor((new Date() - zeroTime) / 1000);
    var xaxis = [];
    var xaxisTotal = 240; //240s

    var xaxisLen = 6;

    for (var i = 0; i < xaxisLen; i++) {
      xaxis.push((currentM - (xaxisLen - i - 1) * (xaxisTotal / xaxisLen)) * 1000 + zeroTime);
    }

    return xaxis;
  }
  /**
   * cpu图， 内存图
   */


  function initCpuChart() {
    var $cpu = $(".index-chat-block .cpu");
    var $heap = $(".index-chat-block .heap"); //内存

    var heapChart = $heap.find(".canvas").chart({
      axis: {
        style: "border-left:1px solid #999;border-bottom:1px solid #999;left:30px;bottom:30px;right:30px;top:30px",
        xstyle: "left:30px;bottom:10px;right:30px;",
        yformat: function yformat(val) {
          return val + "%";
        },
        xformat: function xformat(val) {
          return val.toString().toDate().format("hh:mm:ss");
        },
        ystyle: "left:10px;top:30px;bottom:30px;",
        x: getXaxis(),
        y: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      },
      data: {
        x: [],
        y: []
      }
    }); //cpu

    var cpuChart = $cpu.find(".canvas").chart({
      axis: {
        style: "border-left:1px solid #999;border-bottom:1px solid #999;left:30px;bottom:30px;right:30px;top:30px",
        xstyle: "left:30px;bottom:10px;right:30px;",
        yformat: function yformat(val) {
          return val + "%";
        },
        xformat: function xformat(val) {
          return val.toString().toDate().format("hh:mm:ss");
        },
        ystyle: "left:10px;top:30px;bottom:30px;",
        x: getXaxis(),
        y: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      },
      data: {
        x: [],
        y: []
      }
    });
    $.ajax({
      url: "/rapserver/sockie/port",
      type: "post",
      dataType: "json",
      success: function success(ret) {
        initSockie(ret.port, heapChart, cpuChart);
      },
      error: function error(code, xhr) {
        $.tips(xhr.responseText, "error");
      }
    });
  }
  /**
   * 
   * 初始化sockie
  */


  function initSockie(port, heapChart, cpuChart) {
    socketSend({
      port: port,
      url: "/rapserver/root/cpuAndheap",
      type: "action",
      data: {
        limit: 240
      },
      success: function success(ret) {
        //第一次连接成功返回的数据
        if (ret.model) {
          $cpu.find(".title").html(ret.model);
          $cpu.find(".speed").html(ret.speed);
          $cpu.find(".cpunum").html(ret.count);
          $heap.find(".totalMemory").html(Math.floor(ret.totalMem / 1024 / 1024 / 1024 * 100) / 100);
        }

        $cpu.find(".percent").html(ret.valueStack[len - 1]);
        $heap.find(".useMemory").html(Math.floor((ret.totalMem - ret.freeMem) / 1024 / 1024 / 1024 * 100) / 100);
        cpuChart.redraw({
          axis: {
            x: getXaxis()
          },
          data: {
            x: ret.timeStack.slice(-240),
            y: ret.valueStack.slice(-240)
          }
        });
        heapChart.redraw({
          axis: {
            x: getXaxis()
          },
          data: {
            x: ret.timeStack.slice(-240),
            y: ret.memoryStack.slice(-240)
          }
        });
      }
    });
  }
  /**
   * 填充表单数据
   */


  initFormCache();
  initRootInfo();
  initCpuChart();
})(RBT.dom, RBT.parseTeample, RBT.socketSend);