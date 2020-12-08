;;
(function($, parseTeample, socketSend) {

  $.floatHeight = RBT.floatHeight;
  $.ajax = RBT.ajax;

  //同行等高
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
    var $right = $rootInfo.find(".right .content")
    //获取
    $.ajax({
      url: "/rapserver/root/get",
      dataType: "json",
      success: function(ret) {
        updateRootInfo($right, ret)
      },
      error: function(code, xhr) {
        $.tips(xhr.responseText, "error");
      }
    });

    // 删除
    $rootInfo.on("click", ".J-delPath", function() {
      $.ajax({
        url: "/rapserver/root/del",
        data: { rootId: $(this).data("id") },
        dataType: "json",
        success: function(ret) {
          updateRootInfo($rootInfo, ret);
          $.tips("删除成功", "success", 2000);
        },
        error: function(code, xhr) {
          $.tips(xhr.responseText, "error");
        }
      })
    });

    //添加
    $rootInfo.find(".ipt-form").validForm({
      focus: function($form) {
        $form.find(".form-tips-error").hide();
      },
      success: function($btn, $form) {
        var formParam = {
          path: $form.find("[name='path']").val(),
          rootId: $form.find("[name='rootId']").val()
        }
        $.ajax({
          url: "/rapserver/root/add",
          data: formParam,
          type: "post",
          dataType: "json",
          success: function(ret) {
            updateRootInfo($rootInfo, ret)
            formParam = null;
          },
          error: function(code, xhr) {
            $.tips(xhr.responseText, "error");
          }
        })
      }
    });
  }

  /**
   * 设置更新cookie
   */
  var setLocalStorageTimer

  function setCache(key, value) {
    var staticPathMap = parseStaticMap();
    staticPathMap[key] = value;
    localStorage.setItem("staticPathMap", JSON.stringify(staticPathMap));
    clearTimeout(setLocalStorageTimer);
    setLocalStorageTimer = setTimeout(function() {
      initFormCache();
    }, 200);
  }

  /**
   * 导入cookie
   */
  function initFormCache() {
    var staticPathMap = parseStaticMap();
    $("#staticRootId").downMenu().add(staticPathMap);
    $("#staticRootId").off("change").on("change", function() {
      var key = $(this).val();
      if (staticPathMap[key]) {
        $("#staticRootPath").val(staticPathMap[key])
      }
    })
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
      } catch (e) {

      }
    }
    return staticPathMap;
  }



  /**
   * 去掉前一天的数据
   */
  function cutPoint(timeStack, x1, y1, x2, y2, currentTime) {

    var cutIndex = -1;
    var len = timeStack.length;
    while (len--) {
      if (timeStack[len] > currentTime) {
        cutIndex = len;
        break;
      }
    }
    if (cutIndex != -1) {
      cutIndex = cutIndex + 1;
      x1.splice(0, cutIndex)
      y1.splice(0, cutIndex)
      x2.splice(0, cutIndex)
      y2.splice(0, cutIndex)
    }
  }

  /**
   * cpu图， 内存图
   */
  function initCpuChart() {
    var zeroTime = new Date().setHours(0, 0, 0, 0);
    var currentM = Math.floor((new Date() - zeroTime) / 1000);
    var xaxis = [];
    var cpuChart;
    var heapChart;
    var xaxisTotal = 240;
    var xaxisLen = 6;
    for (var i = 0; i < xaxisLen; i++) {
      xaxis.push(currentM - (xaxisLen - i - 1) * (xaxisTotal / xaxisLen));
    }
    var dataMap = {
      x: [],
      y: []
    };
    var heapDataMap = {
      x: [],
      y: []
    };
    socketSend({
      url: "/global/rapserverCpuInfo",
      type: "action",
      data: { limit: 240 },
      success: function(ret) {

        dataMap.x.length = 0;
        dataMap.y.length = 0;
        xaxis.length = 0;
        zeroTime = new Date().setHours(0, 0, 0, 0);
        currentM = Math.floor((new Date() - zeroTime) / 1000);
        for (var i = 0; i < xaxisLen; i++) {
          xaxis.push(currentM - (xaxisLen - i - 1) * (xaxisTotal / xaxisLen));
        }
        var len = ret.stack.timeStack.length;
        var start = (xaxisTotal > len) ? 0 : (len - xaxisTotal);

        dataMap.x = ret.stack.timeStack.slice(start, len);
        dataMap.y = ret.stack.valueStack.slice(start, len);

        heapDataMap.x = ret.stack.timeStack.slice(start, len);
        heapDataMap.y = ret.stack.memoryStack.slice(start, len);
        if (dataMap.x[0] > currentM) {
          cutPoint(heapDataMap.x, dataMap.x, dataMap.y, heapDataMap.x, heapDataMap.y, currentM)
        }

        $(".module-cpu-wrap .info .title").html(ret.model);
        $(".module-cpu-wrap .info .speed").html(ret.speed);
        $(".module-cpu-wrap .info .cpunum").html(ret.count);
        $(".module-cpu-wrap .info .percent").html(ret.stack.valueStack[len - 1]);
        $(".module-heap-wrap .info .totalMemory").html(Math.floor(ret.totalMem / 1024 / 1024 / 1024 * 100) / 100);
        $(".module-heap-wrap .info .useMemory").html(Math.floor((ret.totalMem - ret.freeMem) / 1024 / 1024 / 1024 * 100) / 100);

        if (cpuChart) {
          cpuChart.redraw({ axis: { x: xaxis }, data: dataMap });
        }
        if (heapChart) {
          heapChart.redraw({ axis: { x: xaxis }, data: heapDataMap });
        }
      }
    });

    //内存
    $(".module-heap-wrap .canvas").chart({
      axis: {
        style: "border-left:1px solid #999;border-bottom:1px solid #999;left:30px;bottom:30px;right:30px;top:30px",
        xstyle: "left:30px;bottom:10px;right:30px;",
        yformat: function(val) {
          return val + "%"
        },
        xformat: function(val) {
          return (val * 1000 + zeroTime).toString().toDate().format("hh:mm:ss")
        },
        ystyle: "left:10px;top:30px;bottom:30px;",
        x: xaxis,
        y: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      },
      data: dataMap
    }, function(initChart) {
      heapChart = initChart;
    })

    //cpu
    $(".module-cpu-wrap .canvas").chart({
      axis: {
        style: "border-left:1px solid #999;border-bottom:1px solid #999;left:30px;bottom:30px;right:30px;top:30px",
        xstyle: "left:30px;bottom:10px;right:30px;",
        yformat: function(val) {
          return val + "%"
        },
        xformat: function(val) {
          return (val * 1000 + zeroTime).toString().toDate().format("mm:ss")
        },
        ystyle: "left:10px;top:30px;bottom:30px;",
        x: xaxis,
        y: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      },
      data: dataMap
    }, function(initChart) {
      cpuChart = initChart;
    })

  }

  /**
   * 填充表单数据
   */
  initFormCache();
  initRootInfo();
  //   initCpuChart();


})(RBT.dom, RBT.parseTeample, RBT.socketSend);