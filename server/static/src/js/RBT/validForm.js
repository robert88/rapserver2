;
(function($, undefined) {
  window.console = window.console || { error: function() {} }
  /**
   * 模板
   * */
  function tpl() {
    var arg = arguments;
    var that = this;
    for (var i = 0; i < arg.length; i++) {
      that = that.replace(new RegExp('\\{' + i + '\\}', "g"), arg[i]);
    }
    return that;
  };
  /**
   * 唯一性校验
   * */
  function unique(str) {
    var obj = {};
    var oldStrArr = str.split("");
    var newArr = [];
    for (var i = 0; i < oldStrArr.length; i++) {
      if (!obj[oldStrArr[i]]) {
        obj[oldStrArr[i]] = 1;
        newArr.push(oldStrArr[i]);
      }
    }
    return newArr.join(",")
  }
  /**
   * 转换为浮点数
   * */
  function parseNum(value) {
    return parseFloat($.trim(value + ""), 10) || 0;
  }
  /**
   * 将字节数转字符个数
   * */
  function getByteLen(val) {
    var temp = 0;
    for (var i = 0; i < val.length; i++) {
      //UTF-8 中文占2字节(统一做成单个字符)
      if (val[i].match(/[^x00-xff]/ig) != null) {
        temp += 2;
      } else {
        temp += 1;
      }
    }
    return temp;
  }
  /**
   * 验证数据类型对应表
   * */
  var validRules = {
    email:
    {
      check: function(value) {
        var value = $.trim(value);
        var invalidLetter;
        if (value.length > 254) {
          return "length-error"
        } else if (value.indexOf("@") == -1) {
          return "at-error"
        } else if (!/^(\w|[!#$%&’*+-/=?^`{}|~.])+@[^@]*$/.test(value)) {
          invalidLetter = value.replace(/@[^@]+$/, "").replace(/\w|[!#$%&’*+-/=?^`{}|~.]/g, "");
          return ["account-letter-forbidden", unique(invalidLetter)]
        } else if (/[.]{2}/.test(value)) {
          return "double-dot-error"
        } else if (!/^.{1,63}@[^@]*$/.test(value)) {
          return "account-length-error"
        } else if (!(/(^[^.].*@[^@]*$)/.test(value) && /^.*[^.]@[^@]*$/.test(value))) {
          return "prevDot-error"
        } else if (!/^[^@]+@([0-9]|[A-Z]|[a-z]|[\-.])+$/.test(value)) {
          invalidLetter = value.replace(/^[^@]+@/, "").replace(/[A-Za-z0–9\-.]/g, "");
          return ["nextLetter-forbidden", unique(invalidLetter)]
        } else if (!(/^[^@]+@[^-].*$/.test(value) && /^[^@]+@.*[^-]$/.test(value))) {
          return "nextLine-error"
        } else if (!/^[^@]+@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
          return "domain-error"
        }
        return false;
      }
    },
    required: { check: function(value) { return ($.trim(value) == ''); } },
    mobile: { check: function(value) { return (!/^\d{5,}$/.test($.trim(value))); } },
    phone: {
      check: function(value) {
        value = $.trim(value).replace(/\s+/g, "")
        var innercheck = (!/^\d{1,}[0-9-]{3,}$/.test(value));
        var outercheck = (!/^\+\d{1,}[0-9-]{3,}$/.test(value));
        return innercheck && outercheck
      }
    },
    letter: { check: function(value) { value = $.trim(value); return !(getByteLen(value) == value.length) } },
    chinese: { check: function(value) { return (!/^[\u4e00-\u9fff]+$/.test($.trim(value))); } },
    date: { check: function(value) { return (/Invalid|NaN/.test(new Date($.trim(value)).toString())); } },
    //请输入有效身份证
    idcard: { check: function(value) { return (!(/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/.test(value) || /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/.test(value))); } },
    maxvalue: {
      check: function(value, $obj) {
        //传递了比较值
        var value2 = $obj.data("maxvalue");
        if (value2) {
          this.value = parseNum(value2);
        }
        value = parseNum(value);
        return (!(value <= this.value));
      }
    },
    minvalue: {
      check: function(value, $obj) {
        //传递了比较值
        var value2 = $obj.data("minvalue");
        if (value2) {
          this.value = parseNum(value2);
        }
        value = parseNum(value);
        return (!(value >= this.value));
      }
    },
    multiple: {
      check: function(value, $obj) {
        //传递了比较值
        var value2 = $obj.data("multiple");
        if (value2) {
          this.value = parseNum(value2);
        }
        value = parseNum(value);
        return ((value % this.value));
      }
    },
    bigger: {
      check: function(value, $obj) {
        //传递了比较值
        var $bigger = $($obj.data("bigger"));
        var value2 = $bigger.val();
        //比较的值必须有输入
        if ((typeof value2 == "undefined") || (value2 == "")) {
          return;
        }
        if (value2) {
          this.value = parseFloat(value2, 10);
        }
        value = parseFloat(value, 10);

        return (!(value < this.value));
      }
    },
    matchoption: {
      check: function(value, $obj) {
        var isTextValue = $obj.parents(".J-select").find(".J-select-text").val();
        var isValue = $obj.parents(".J-select").find(".J-select-value").val()
        return (isTextValue && (isValue == null || isValue == ""));
      }
    },
    smaller: {
      check: function(value, $obj) {
        //传递了比较
        var $bigger = $($obj.data("smaller"));
        var value2 = $bigger.val();
        //比较的值必须有输入
        if ((typeof value2 == "undefined") || (value2 == "")) {
          return;
        }
        if (value2) {
          this.value = parseFloat(value2, 10);
        }
        value = parseFloat(value, 10);
        return (!(value > this.value));
      }
    },
    maxlength: {
      check: function(value, $obj) {
        return (!(value.length <= parseNum($obj.data("maxlength"))));
      }
    },
    minlength: {
      check: function(value, $obj) {
        return (!(value.length >= parseNum($obj.data("minlength"))));
      }
    },
    pswagain:
    {
      check: function(value, $obj) {
        //传递了比较值pswAgain传递是一个jquery选择器字符
        var sel = $obj.data("pswagain");
        var value2 = $(sel).val();

        return (!($.trim(value) == $.trim(value2)));
      }
    },
    password: {
      check: function(value, $obj) {
        if (/^\d+$/.test(value.trim())) {
          return true;
        } else if (!/\d/.test(value.trim())) {
          return true;
        } else {
          return false
        }
      },
    }

  };
  /**
   *
   * 跟据校验规则校验单条数据
   * */

  function checkBothRule(checkBothType, $target, value, from) {
    var errorCode
    var errorMsg;
    var errorParams;
    var checkTypeName;
    var orCheck = checkBothType.length > 1 ? true : false;

    for (var j = 0; j < checkBothType.length; j++) {
      checkTypeName = checkBothType[j];
      //如果checktype没有或者checktype函数没有就跳出循环继续
      if (!validRules[checkTypeName] || !validRules[checkTypeName].check) {
        continue;
      }

      //在submit的时候提交
      if (from == "blur" && value == "" && !$target.parents("form").data("blur-check-empty")) {
        continue;
      }

      //将对象和值传递过去 true表示错误
      errorCode = validRules[checkTypeName].check(value, $target);
      errorMsg = "";
      if (errorCode) {
        checkTypeName = checkTypeName.toLowerCase();
        errorMsg = $target.data(checkTypeName + "-msg") || $target.data(checkTypeName + "-default-msg");
        //校验带参数
        if (typeof errorCode == "object") {
          errorParams = errorCode.slice(1);
          errorCode = errorCode[0].toLowerCase();
          errorMsg = tpl.apply($target.data(checkTypeName + "-" + errorCode + "-msg"), errorParams);
        } else if (typeof errorCode == "string") {
          errorCode = errorCode.toLowerCase();
          errorMsg = $target.data(checkTypeName + "-" + errorCode + "-msg")
        }

        //校验成功之后的函数,“或”规则只要成功就跳出
      } else if (orCheck) {
        errorMsg = "";
        errorCode = "";
        checkTypeName = "";
        break;
      }
    }
    return { code: errorCode, msg: errorMsg, checkType: checkTypeName }
  }
  /**
   *
   * 跟据校验规则校验单条数据
   * */
  function checkByRule($subFrom, $target, error, success, from) {

    var value, name;
    if ($target.data("check-is-html")) {
      value = $.trim($target.html().replace(/\n|\t/g, ""));
    } else if ($target.length && ($target.attr("type") == "checkbox")) {
      name = $target.attr("name");
      value = $subFrom.find("input[name='" + name + "']:checked").length ? "1" : "";
    } else if ($target.length && ($target.attr("type") == "radio")) {
      name = $target.attr("name");
      value = $subFrom.find("input[name='" + name + "']:checked").length ? "1" : "";
    } else {
      value = $.trim($target.val());
    }

    var checkTypes = $target.attr("check-type");
    var checkBothType

    //共同校验分隔符'空格' '，' '&&'
    checkTypes = (checkTypes && checkTypes.split(/\s+|,|&&/)) || [];

    for (var i = 0; i < checkTypes.length; i++) {
      //"或"规则的检测项
      checkBothType = checkTypes[i].split("|");
      //校验"或"规则
      var checkStatus = checkBothRule(checkBothType, $target, value, from);

      //当前校验有错误
      if (checkStatus.code) {
        if ($.type(error) == "function") {
          error($target, checkStatus.code, checkStatus.msg, checkStatus.checkType);
        }
        return false;
      }


    } //end for i

    //全部成功之后单个校验完成
    if ($.type(success) == "function") {
      if (from == "blur" && value == "" && !$target.parents("form").data("blur-check-empty")) {
        //空字符且为blur事件
      } else {
        success($target);
      }
    }

    //全部类型都校验成功之后返回true
    return true;
  }

  /**校验执行函数
   * opts = setRule 外部使用用于扩展校验方法
   * opts = setBlur 内部使用用于绑定blur校验
   * */

  function checkForm($subFrom, opts, success, successList, error, obj) {
    var $subFormInput
    //刷选出校验的数据
    if (opts == "setBlur") {
      $subFormInput = $subFrom.find("input")
        .add($subFrom.find("textarea"))
        .add($subFrom.find("select"))
        .add($subFrom.find(".needCheck"))
    } else {
      $subFormInput = $subFrom.find("input")
        .add($subFrom.find("textarea"))
        .add($subFrom.find("select"))
        .add($subFrom.find(".needCheck"))
        .not(".noCheck")
        .not(":disabled")
    }
    var retVal = true;

    $subFormInput.each(function() {

      var $this = $(this);

      //如果没有设置checktype就返回
      if (!$this.attr("check-type")) {
        return;
      }

      //如果设置focus,blur为true 函数为设定绑定focus,blur事件,
      if (opts == "setBlur") {
        if (!$this.data("blur")) {
          //不重复绑定
          $this.data("blur", false);
          $this.bind("blur", function() {

            //用于动态取消校验
            if ($this.hasClass("noCheck") || $this.is(":disabled")) {
              return;
            }

            //这里的校验不会传递successList
            if (typeof obj.blurCallback == "function") {
              //当还有校验的时候不应该传递success
              if (checkByRule($subFrom, $this, error, null, "blur") == true) {
                obj.blurCallback($this, successList);
              }
            } else {
              checkByRule($subFrom, $this, error, successList, "blur");
            }
          });
        }

        if (!$this.data("focus")) {
          $this.data("focus", false);
          $this.bind("focus", function() {
            if (typeof obj.focusCallback == "function") {
              obj.focusCallback($this);
            }
          });
        }
        return;
      }


      //跟据校验规则校验单条数据
      var retItemVal = checkByRule($subFrom, $this, error, successList);

      //只要发生错误就会一直保持错误值
      if (retVal) {
        retVal = retItemVal;
      }

      //当发生错误时，且one-error-throw=true。执行一条错误校验。并且之后表单停止校验直接返回
      if ($subFrom.data("one-error-throw") && retVal == false) {
        return false;
      }

    }); //end each

    //不进行校验
    if (opts == "setBlur") {
      return;
    }

    //如果全部通过
    if (($.type(success) == "function") && retVal) {

      success($subFrom);
    }

    return retVal;
  }

  /**
   * 校验初始化函数。提供一个校验函数
   * */
  function valiForm(obj) {

    var selector = obj.form || "",
      successList = obj.successList,
      success = obj.success,
      error = obj.error;

    if (error == undefined) {
      error = alert
    }

    //提供选择器缓存和不缓存
    var $subFrom;

    if ($.type(selector) == "string") {

      $subFrom = $(selector);

    } else {

      $subFrom = selector;

    }

    //失去焦点就校验对象
    checkForm($subFrom, "setBlur", success, successList, error, obj);

    //验证执行函数 //工厂模式
    return function(opts) {

      //设置校验参数
      if (opts == "getRule") {
        return validRules;
      }

      return checkForm($subFrom, opts, success, successList, error);
    }

  } //end valiForm2
  /**
   * 提交按钮全部填充完才显示提交状态
   * */
  function initDisableBtn($form) {
    var $input = $form.find("input");
    var $select = $form.find("select");
    var $textarea = $form.find("textarea")
    var $check = $input.add($select).add($textarea).not(".noCheck").not(":disabled").filter(function() {
      var checkType = $(this).attr("check-type")
      if (checkType || (checkType && checkType.indexOf("required") == -1)) {
        return true;
      }
      return false;
    });

    var $needCheck = $check;
    if ($form.find(".J-enable-button").length) {
      $needCheck = $form.find(".J-enable-button");
    }

    function checkBtn() {
      var ret = true;
      $needCheck.each(function() {
        if (!$(this).val() && $(this).val() !== 0) {
          ret = false;
          return false;
        }
        if ($(this).attr("type") == "radio" || $(this).attr("type") == "checkbox") {
          var name = $(this).attr("name");
          var checkVal = $("input[name='" + name + "']:checked").val()
          if (!checkVal && checkVal !== 0) {
            ret = false;
            return false;
          }
        }
        if ($(this).parents(".J-validItem.validError").length) {
          ret = false;
          return false;
        }
      });
      if (ret) {
        $form.find(".J-submitBtn.J-submitFocus").removeClass("disabled");
      } else {
        $form.find(".J-submitBtn.J-submitFocus").addClass("disabled");
      }
    }
    //输入之后变亮
    $form.off("keyup.checkBtn", "input,textarea").on("keyup.checkBtn", "input,textarea", function() {
      checkBtn();
    });

    $form.off("change.checkBtn", "select,input,textarea").on("change.checkBtn", "select,input,textarea", function() {
      checkBtn();
      //特殊处理
      if ($(this).attr("type") == "radio") {
        $(this).parents(".J-validItem").removeClass("validError")
      }
    });
    checkBtn();
  }
  /**
   * 校验功能化函数
   * */
  function valiFormMiddle($form, opts) {
    var validOpts = {
      form: $form,
      success: function() {
        if (typeof opts.success == "function" && opts.success($currentSubBtn, $form) === false) {
          return;
        }
        $form.removeClass("validing");
      },
      successList: function($target) {
        if (typeof opts.successList == "function" && opts.successList($target, $form) === false) {
          return;
        }
        $target.parents(".J-validItem").removeClass("validError").addClass("validSuccess");
      },
      blurCallback: function($target, success) {
        if (typeof opts.blur == "function" && opts.blur($target, $form) === false) {
          return false;
        } else if (typeof success == "function") {
          //如果没有ajax校验就成功了
          if (!$target.data("ajax-check")) {
            success($target);
          }
        }
      },
      focusCallback: function($target) {
        if (typeof opts.focus == "function" && opts.focus($target, $form) === false) {
          return;
        }
        $target.parents(".J-validItem").removeClass("validError").removeClass("validSuccess");
      },
      error: function($target, code, msg, type) {
        if (typeof opts.error == "function" && opts.error($target, code, msg, type, $form) === false) {
          return;
        }
        var $parents = $target.parents(".J-validItem").addClass("validError");
        $parents.find(".J-valid-msg").html(msg);
        $form.removeClass("validing");
        if (typeof opts.errorAfter == "function") {
          opts.errorAfter($target, code, msg, type, $form);
        }
      }
    };
    //解决多个提交按钮的不同校验
    var $currentSubBtn;
    $form.off("click", ".J-submitBtn").on("click", ".J-submitBtn", function() {
      //提交按钮在提交之后如果表正在校验就停止校验，没有变亮按钮也是不能校验的
      if ($form.hasClass("validing") || $(this).hasClass("disabled")) {
        return false;
      }
      $currentSubBtn = $(this);
      $form.submit();
    });

    // 提交按钮全部填充完才显示提交状态指定J-submitFocus
    initDisableBtn($form)

    //对于提交按钮要求指定focus
    $("body").off("keyup.submit").on("keyup.submit", function(e) {
      //enter
      if ((e.keyCode * 1 == 13) && !$(e.target).hasClass("J-select") && !$(e.target).parents(".J-select").length && e.target.nodeName != "TEXTAREA") {
        $(this).find(".J-submitBtn.J-submitEnter").trigger("click");
        e.stopPropagation();
        e.preventDefault();
      }
    });

    var validForm = valiForm($.extend({}, opts, validOpts));

    //提交
    $form.off("submit").on("submit", function() {
      try {
        /*防止重复提交*/
        var $this = $(this);
        if ($this.hasClass("validing")) {
          return false;
        }
        $this.addClass("validing");
        validForm();
      } catch (e) {
        console.error(e && e.stack);
      }
      return false;
    });
    //外部引用校验函数
    $form.data("valid-form", validForm);
  }

  $.fn.validForm = function(opts) {
    return this.each(function() {
      valiFormMiddle($(this), opts)
    })
  }

  function layzeSetVisible($this) {
    var selectHeight = $this.height();
    var selectOffsetTop = $this.offset().top;
    var optionsMaxHeight = parseNum($this.find(".J-select-option").css("max-height"));
    var optionsMinHeight = parseNum($this.find(".J-select-option").css("min-height"));
    var optionsContentHeight = parseNum($this.find(".J-select-option").height());
    var optionsHeight = 0;
    $this.find(".J-select-option").children().each(function() {
      optionsHeight += $(this).height();
    })
    optionsHeight = Math.min(optionsHeight, optionsMaxHeight)
    optionsHeight = Math.max(optionsHeight, optionsMinHeight)
    optionsHeight = Math.max(optionsHeight, optionsContentHeight)
    var wheight = $(window).height();
    var scrollTop = $(window).scrollTop()
    if (selectOffsetTop + selectHeight + optionsHeight < wheight + scrollTop) {
      $this.find(".J-select-option").removeClass("visible-up");
    } else if (selectOffsetTop - optionsHeight > scrollTop) {
      $this.find(".J-select-option").addClass("visible-up");
    } else {
      $this.find(".J-select-option").removeClass("visible-up");
    }

  }

  function isMobile(userAge) {
    // var wap = $(window).width()<992;
    var isIphone = /\(iPhone;/i.test(userAge);
    var isIpad = /\(iPad;/i.test(userAge);
    var isIpod = /\(iPod;/i.test(userAge);
    var isAndroid = userAge.match(/android-?\s*(\d+\D\d+(\D\d+)?)/i) || userAge.match(/Linux\s(armv7l)/i)
    var SymbianOS = /SymbianOS/i.test(userAge);
    var IEMobile = userAge.match(/IEMobile\s*(\d+(\D\d+)?(\D\d+)?)/i);
    var isMobile = /Mobile/i.test(userAge);
    var BlackBerry = userAge.match(/BlackBerry\s(\d+(\D\d+)?)/i) || userAge.match(/BB10;/i);
    var isUc = userAge.match(/UCWEB\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i) || /\bUC\b/.test(userAge);
    var hpwOS = userAge.match(/hpwOS\s*\/\s*(\d+\D\d+(\D\d+)?)/);
    var BrowserNG = userAge.match(/BrowserNG\s*\/\s*(\d+\D\d+(\D\d+)?)/);
    var chromeMobile = userAge.match(/CrMo\s*\/\s*(\d+\D\d+(\D\d+)?)/i) || userAge.match(/CriOS\s*\/\s*(\d+\D\d+(\D\d+)?)/i) || userAge.match(/CrOS\si686\s*(\d+\D\d+(\D\d+)?)/i)
    var OperaMini = userAge.match(/Opera\sMini\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i)
    var SAMSUNG = userAge.match(/SAMSUNG/)
    if (isIphone || isIpad || isIpod || isAndroid || isMobile || SymbianOS || BlackBerry || IEMobile || isUc || hpwOS || BrowserNG || chromeMobile || OperaMini || SAMSUNG) {
      return true
    }
  }
  var browserMobile = isMobile(window.navigator.userAgent);

  $("body").off("initselect").on("initselect", function() {
    initSelect();
  })
  /**
   * 下拉菜单
   * */
  function initSelect() {
    $("form,.J-selectParent").each(function() {
      if ($(this).data("initselect")) {
        return
      }
      $(this).data("initselect", true);

      $(this).off("touchstart,mouseup", ".J-select").on("touchstart,mouseup", ".J-select", function(e) {

        var $this = $(this)

        if (e.type != "touchstart" && browserMobile) {
          return;
        } else if (e.type != "mouseup" && !browserMobile) {
          return;
        }
        if ($(this).hasClass("J-mobile-select") && browserMobile) {
          return
        }
        //移动端需要点击滑动
        if ((browserMobile || $(window).width() < 992) && $(e.target).parents(".J-select-option").length) {
          return;
        }
        if ($this.hasClass("J-option-multi") && ($(e.target).hasClass(".J-select-option") || $(e.target).parents(".J-select-option").length)) {
          return false;
        }
        if ($this.hasClass("J-tree-select") && ($(e.target).hasClass(".J-select-option") || $(e.target).parents(".J-select-option").length)) {
          return false;
        }
        if ($this.hasClass("J-mutil-select") && ($(e.target).hasClass(".J-select-option") || $(e.target).parents(".J-select-option").length)) {
          return false;
        }
        if ($this.hasClass("J-select-multi-list") && !$(e.target).hasClass("option") && ($(e.target).hasClass("option-group") || $(e.target).parents(".option-group").length)) {
          return;
        }
        if ($this.hasClass("J-select-multi-tree-list") && ($(e.target).hasClass("option-group") || $(e.target).parents(".option-group-item").length || $(e.target).parents(".option-group").length)) {
          return;
        }
        if (!$this.data("show-other")) {
          $(".J-select").not($this).removeClass("current").trigger("selecthide");
        }
        if ($this.hasClass("current")) {
          $this.removeClass("current").trigger("selecthide")
        } else {
          //避免和active同时存在
          // if ($this.hasClass("J-option-multi")&& $this.find(".option-group.active").length!=0) {
          //   $this.find(".option-group").removeClass("showActive")
          // }
          $this.addClass("current");
        }


        if ($this.hasClass("J-vertical-visible")) {
          layzeSetVisible($this);
        }

        //选中
      }).off("click", ".J-select-option .option").on("click", ".J-select-option .option", function(e) {



        if ($(this).parents(".J-select").hasClass("J-mobile-select") && browserMobile) {
          return
        }

        if ($(this).parents(".J-select").hasClass("J-select-multi-tree-list") && $(this).parents(".option-group-content").length) {
          if (!($(e.target).hasClass("checkbox-wrap") || $(e.target).parents(".checkbox-wrap").length)) {
            return;
          }
        }

        var $option = $(this);

        var value = $option.data("value");
        var $select = $option.parents(".J-select");
        var $allOptions = $select.find(".option");
        var $selectText = $select.find(".J-select-text");
        var $selectValue = $select.find(".J-select-value");
        var $selectParentValue = $select.find(".J-select-parent-value");
        var $curInput;
        var selectData

        //多选获取值
        function getMutilOptionData($select) {
          var names = [];
          var values = [];
          var allSelect = true;
          $select.find(".option input").each(function() {
            var $input = $(this);
            var $curOption = $input.parents(".option");
            if (!$input.hasClass("J-select-all-ipt")) {
              if ($input.prop("checked")) {
                names.push($curOption.data("name"));
                values.push($curOption.data("value"));
              } else {
                allSelect = false;
              }

            }
          });
          return { names: names, values: values, allSelect: allSelect }
        }
        //处理多选checkbox
        function handlerMutilCheckbox() {
          var $curInput = $option.find("input");
          if ($curInput.prop("checked")) {
            $curInput.prop("checked", false);
          } else {
            $curInput.prop("checked", true);
          }

          //全选
          if ($curInput.hasClass("J-select-all-ipt")) {
            if ($curInput.prop("checked")) {
              $select.find("input").prop("checked", true);
              var selectData = getMutilOptionData($select);
              $selectText.val($option.data("name")).change();
              $selectValue.val(selectData.values.join(",")).change();
            } else {
              $select.find("input").prop("checked", false);
              $selectText.val("").change();
              $selectParentValue.val("").change();
              $selectValue.val("").change();
            }
          } else {
            var selectData = getMutilOptionData($select);
            //已经全部选中需要把all-option的input的点亮


            if ($select.find(".J-select-all-ipt").length) {
              if (selectData.allSelect) {
                $select.find(".J-select-all-ipt").prop("checked", true);
                $selectText.val($select.find(".J-select-all-ipt").parents(".option").data("name")).change();
              } else {
                $select.find(".J-select-all-ipt").prop("checked", false);
                $selectText.val(selectData.names.join(",")).change();
              }
            } else {
              $selectText.val(selectData.names.join(",")).change();
            }

            $selectValue.val(selectData.values.join(",")).trigger("change");
          }
          $allOptions.removeClass("active")
          $select.find("input:checked").each(function() {
            $(this).parents(".option").addClass("active");
          })
        }
        //处理elive 日期checkbox
        function handlerMutilOptionCheckbox($parent) {
          //清除其他的选项
          $select.find(".option-group-item").not($parent).find("input").prop("checked", false);
          var $curInput = $option.find("input");
          if ($curInput.prop("checked")) {
            $curInput.prop("checked", false);
          } else {
            $curInput.prop("checked", true);
          }

          $select.find(".option-group").removeClass("active");

          var titleName = $select.find(".option-group").eq($parent.index()).find(".option-group-title").data("name");
          titleName = titleName && titleName.toString().replace(/^\s+|\s+$/, "")
          //全选
          if ($curInput.hasClass("J-select-all-ipt")) {
            if ($curInput.prop("checked")) {
              $parent.find("input").prop("checked", true);
              var selectData = getMutilOptionData($parent);
              //需要提前设置selectParentValue，外部统一监听select-value
              $selectParentValue.val(titleName).change();
              $selectText.val($option.data("name")).change();
              $selectValue.val(selectData.values.join(",")).change();
            } else {
              $parent.find("input").prop("checked", false);
              $selectParentValue.val("").change();
              $selectText.val("").change();
              $selectValue.val("").change();
            }
          } else {
            var selectData = getMutilOptionData($parent);
            //已经全部选中需要把all-option的input的点亮
            if (selectData.allSelect) {
              $parent.find(".J-select-all-ipt").prop("checked", true);
              $selectText.val($parent.find(".J-select-all-ipt").parents(".option").data("name")).change();
            } else {
              $parent.find(".J-select-all-ipt").prop("checked", false);
              $selectText.val(selectData.names.join(",")).change();
            }
            if (selectData.values.length) {
              $selectParentValue.val(titleName).change();
            } else {
              $selectParentValue.val("").change();
            }
            $selectValue.val(selectData.values.join(",")).trigger("change");

          }
          if ($parent.find("input:checked").length) {
            $select.find(".option-group").eq($parent.index()).addClass("active")
          }
          $allOptions.removeClass("active")
          $parent.find("input:checked").each(function() {
            $(this).parents(".option").addClass("active");
          });

        }
        //树形结构
        function getTreeOptionData($select, oldData) {
          oldData = oldData || { names: [], values: [], allSelect: true }
          $select.find(">.J-select-option>.option>.minicheckbox-wrap input").each(function() {
            var $input = $(this);
            var $curOption = $input.parent().parent();
            if ($input.prop("checked")) {
              oldData.names.push($curOption.data("name"));
              oldData.values.push($curOption.data("value"));
            } else if ($curOption.length) {
              getTreeOptionData($curOption, oldData);
              oldData.allSelect = false;
            }
          });
          return oldData;
        }
        //树形checkbox
        function hanlderTreeCheckBox() {
          $curInput = $option.find(">.minicheckbox-wrap>input");
          if ($curInput.length && !($(e.target).hasClass("J-select-expention") || $(e.target).parents().hasClass("J-select-expention"))) {
            var $allInput = $option.find("input");
            if ($curInput.prop("checked")) {
              //子类全部设置false
              $allInput.prop("checked", false).change();
              //父类全部设置false
              $curInput.parents(".option").each(function() {
                $(this).find(">.minicheckbox-wrap>input").prop("checked", false).change();;
              })
            } else {
              //子类全部设置true
              $allInput.prop("checked", true).change();
              //父类需要检测是否全选
              $curInput.parents(".option").each(function() {
                var isAllTrue = true;
                $(this).find(".J-select-option input").each(function() {
                  if (!$(this).prop("checked")) {
                    isAllTrue = false;
                    return false
                  }
                })
                if (isAllTrue) {
                  $(this).find(">.minicheckbox-wrap>input").prop("checked", true).change();
                }
              })
            }
            var selectData = getTreeOptionData($select);
            $allOptions.removeClass("active");
            $select.find("input:checked").each(function() {
              $(this).parents(".option").addClass("active");
            })
            $selectText.val(selectData.names.join(",")).change();
            $selectValue.val(selectData.values.join(",")).change();

          } else {
            if ($(e.target).hasClass("J-not-click") || $(e.target).parents(".J-not-click").length) {
              e.stopPropagation();
              e.preventDefault();
            } else {
              $option.toggleClass("open");
            }
          }
        }
        //树形+多选checkbox
        function hanlderMutilTreeCheckBox() {

          //设置值
          var $curInput = $option.find("input");
          if ($curInput.prop("checked")) {
            $curInput.prop("checked", false);
          } else {
            $curInput.prop("checked", true);
          }
          var $left, $right, index;
          if ($curInput.parents(".option-group").length) {
            $left = $curInput.parents(".option-group")
            index = $left.index();
            $right = $select.find(".option-group-item").eq(index);
            if ($curInput.prop("checked")) {
              $right.find("input").prop("checked", true);
            } else {
              $right.find("input").prop("checked", false);
            }
          } else {
            $right = $curInput.parents(".option-group-item");
            index = $right.index();
            $left = $select.find(".option-group").eq(index);
            var selectAll = true;
            $right.find("input").each(function() {
              if (!$(this).prop("checked")) {
                selectAll = false;
                return false
              }
            })
            $left.find("input").prop("checked", selectAll);
          }

          var selectData = { names: [], values: [] }

          //处理active 和获取值
          $select.find(".option-group").each(function() {
            var $leftItem = $(this);
            var matchIndex = $leftItem.index();
            var $rightItem = $select.find(".option-group-item").eq(matchIndex);
            if ($leftItem.find("input").prop("checked")) { //全选
              $leftItem.find(".option").addClass("active");
              $rightItem.find(".option").addClass("active");
              $leftItem.addClass("active")
              var titleName = $leftItem.find(".option").data("name");
              var titlevalue = $leftItem.find(".option").data("value");
              titleName = titleName && titleName.toString().replace(/^\s+|\s+$/, "")
              selectData.names.push(titleName)
              selectData.values.push(titlevalue)
            } else {
              $leftItem.find(".option").removeClass("active")
              $leftItem.removeClass("active");
              $rightItem.find("input").each(function() {
                var $op = $(this).parent().parent(); //必须是两层结构
                if ($(this).prop("checked")) {
                  $leftItem.find(".option").addClass("active")
                  $leftItem.addClass("active") //有值
                  selectData.names.push($op.data("name"));
                  selectData.values.push($op.data("value"));
                  $op.addClass("active");
                } else {
                  $op.removeClass("active");
                }
              })
            }
          })


          $selectText.val(selectData.names.join(",")).change();
          $selectValue.val(selectData.values.join(",")).change();
        }

        //默认
        function handlerNormal() {
          if ($select.data("cancel-self") && $option.hasClass("active")) {
            $selectText.val("").change();
            $selectValue.val("").data("option", {}).change();
            $option.removeClass("active")
            return;
          }
          var name = $option.data("name");
          $selectText.val(name && name.toString().replace(/^\s+|\s+$/, "")).change();
          $selectValue.val(value).data("option", $option.data()).change();

          if (!$select.data("show-other") && !$option.data("keyupselect")) {
            $(".J-select").removeClass("current").trigger("selecthide");
            $selectText.blur()
          }
          //还原
          $option.data("keyupselect", false);
          //附带标题
          var $parent = $option.parents(".option-group");
          var titleName
          if ($parent.length == 0) {
            titleName = $option.parents(".J-select-option").find(".option-group").eq($option.parents(".option-group-item").index()).find(".option-group-title").data("name")
          } else {
            titleName = $parent.find(".option-group-title").data("name")
          }

          $selectParentValue.val(titleName && titleName.toString().replace(/^\s+|\s+$/, "")).change();
          $allOptions.removeClass("active")
          $option.addClass("active")
          //可以取消自己
        }
        //多选，多列
        if ($select.hasClass("J-option-multi")) {
          handlerMutilOptionCheckbox($option.parents(".option-group-item"))
          //多选
        } else if ($select.hasClass("J-mutil-select")) {
          handlerMutilCheckbox();
          //树形结构
        } else if ($select.hasClass("J-tree-select")) {
          hanlderTreeCheckBox();
        } else if ($select.hasClass("J-select-multi-tree-list")) {
          hanlderMutilTreeCheckBox();
        } else {
          handlerNormal();
        }
        if ($selectValue.val() != "") {
          $selectText.addClass("ipt-not-empty");
        } else {
          $selectText.removeClass("ipt-not-empty");
        }
        return false;
      }).on("focus.select", ".J-select-text", function() {

        var $this = $(this);
        clearTimeout($this.data("timer"));
        $(this).parents(".J-validItem").removeClass("validError").removeClass("validSuccess");
      }).on("blur.select", ".J-select-text", function() {
        //这样可以在focus的时候清除调退出

        var $this = $(this);
        //多选的时候
        if ($this.parents(".J-mutil-select").length || $this.parents(".J-tree-select").length || $this.parents(".J-select-multi-tree-list").length) {
          return
        }
        var timer = setTimeout(function() {
          $this.parents(".J-select").removeClass("current").trigger("selecthide");
          $this.parents(".J-select").find(".focusActive").removeClass("focusActive");
          console.log("tabFocus")
          $this.parents(".J-select").removeClass("tabFocus");
        }, 310);
        $this.data("timer", timer);

        //触发一下失去焦点
        $this.parents(".J-select").find(".J-select-value").blur()
      }).on("click.select", function(e) {
        if (!$(e.target).hasClass("J-select") && $(e.target).parents(".J-select").length == 0) {
          $(".J-select").removeClass("current").trigger("selecthide");
        } else {
          $(".J-select .J-select-text").each(function() {
            var $this = $(this);
            clearTimeout($this.data("timer"))
          })
        }
        //支持搜索功能，data-jp,data-qp,data-name//不能代理事件，隐藏之后（去掉current）不能触发事件
      }).find(".J-select-text").on("keyup.select", function(e) {
        if (e.key.length > 1 && e.keyCode != 8) {
          return;
        }
        var key = $.trim($(this).val());
        var $value = $(this).parent().find(".J-select-value");
        if (key) {
          var $optionByName = $(this).parents(".J-select").find(".option[data-name='" + key + "']");
          if ($optionByName.length) {
            $value.val($optionByName.data("value") || "");
          } else {
            $value.val("");
          }
        } else {
          $value.val("");
        }
        if ($(this).parents(".J-select-search").length) {
          var $select = $(this).parents(".J-select-search")
          var $selectOptionsWrap = $select.find('.J-select-option');
          var $allOptions = $selectOptionsWrap.find('.option');
          var noResultflag = true
          $allOptions.each(function() {
            var searchStr = [($(this).data("qp") || ""), ($(this).data("jp") || ""), ($(this).data("name") || "")].join(",")
            if (searchStr.toLowerCase().indexOf(key.toLowerCase()) == -1) {
              $(this).hide();
            } else {
              $(this).show();
              noResultflag = false;
            }
          })
          if (!$select.hasClass("current")) {
            $select.addClass("current")
          }
          var noMsg = ($(this).parents(".J-select-search").find('.J-select-option').data("no-result") || "无")
          if (!$select.find(".no-result-option").length) {
            $selectOptionsWrap.append("<li class='no-result-option hidden' style='padding:10px' data-value='' data-name='" + noMsg + "'>" + noMsg + "</li>")
          }
          if (noResultflag) {
            $select.find(".no-result-option").removeClass("hidden");
          } else {
            $select.find(".no-result-option").addClass("hidden");
          }


        }
        //空值校验
      })
      var $that = $(this).find(".J-validItem")
      $that.find("textarea").each(function(){
        $(this).data("orgheight",$(this).height());
      })
      $that.on("change.checkEmpty", "select,input,textarea", function(e) {
        if ($.trim($(this).val())) {
          $(this).addClass("ipt-not-empty");
        } else {
          $(this).removeClass("ipt-not-empty");
        }
      })
      $that.on("keyup.checkEmpty", "select,input,textarea", function(e) {
        if ($.trim($(this).val())) {
          $(this).addClass("ipt-not-empty");
          if(this.nodeName=="TEXTAREA"&&this.scrollHeight>=$(this).height()){
            $(this).height(this.scrollHeight);
          }else{
            $(this).height($(this).data("orgheight"));
          }
        } else {
          $(this).removeClass("ipt-not-empty");
        }
        
      });


    })


  }

  var activeTabReset = true;
  var $TabTagert; //当前tab
  var stopDocumentClick = false;
  $(document).on("click.select", function(e) {
    //防止tabfocus消失之后，定位不到当前的tab操作
    if (stopDocumentClick) {
      return;
    }
    if (!$(e.target).hasClass("J-select") && $(e.target).parents(".J-select").length == 0) {
      $(".J-select").removeClass("current").trigger("selecthide");
    }
    $(".tabFocus").removeClass("tabFocus");
    $TabTagert = null;
    activeTabReset = true;
    // console.log("tab")
    //支持搜索功能，data-jp,data-qp,data-name
  });



  //初始化按键操作
  function initFormKey() {

    var tabClass = ".J-tabItem"
    var $input = $(tabClass);
    var len = $input.length;
    var currentTabIndex = 0;
    var $currentTabSelect;
    var perIndex;

    //处理tab键
    function hanlderTab(e) {
      // if (e.key == "Tab") {
      if ((e.keyCode * 1 == 9)) {
        if ($currentTabSelect) {
          $currentTabSelect.removeClass("current");
          $currentTabSelect = null;
        }
        var activeElement;
        var $visibleInput = $input.filter(function() { return $(this).is(":visible") })

        if (activeTabReset) {
          //如果是选中了文字activeElement就会为body
          if (document.activeElement == document.body && window.getSelection) {
            activeElement = window.getSelection().anchorNode;
            if (activeElement && $(activeElement).find(tabClass).length) {
              activeElement = $(activeElement).find(tabClass)[0]
            }
          } else {
            activeElement = document.activeElement;
          }
          $visibleInput.each(function(idx) {
            if (this == activeElement || (this == $(activeElement).parents(tabClass)[0])) {
              currentTabIndex = idx + 1;
              return false
            }
          })
        } else {
          currentTabIndex++;
        }
        activeTabReset = false;

        if (currentTabIndex >= $visibleInput.length) {
          currentTabIndex = 0;
        }


        $(".tabFocus").removeClass("tabFocus")
        $TabTagert = $visibleInput.eq(currentTabIndex);
        $TabTagert.focus().addClass("tabFocus");
        if ($TabTagert.parents(".J-select").length) {
          $currentTabSelect = $TabTagert.parents(".J-select");
          $currentTabSelect.trigger(browserMobile ? "touchstart" : "mouseup");
        }
        e.stopPropagation();
        e.preventDefault();
      }
    }


    //设置group选中
    function setGroupFocus($select) {
      $select.data("keydir", ".option-group").removeClass("keyfocusOption").addClass("keyfocusGroup");
    }
    //设置group-item选中
    function setGroupItemFocus($select) {
      $select.data("keydir", ".option").removeClass("keyfocusGroup").addClass("keyfocusOption");
    }
    //获取当前焦点group
    function getGroupFocusOption($select) {
      var $option = $select.find(".option-group.focusActive");
      //当没有focus的时候，应该选择之前选过的选项
      if ($option.length == 0) {
        $option = $select.find(".option-group.showActive");
      }
      return $option
    }
    //获取当前焦点group-item
    function getGroupItemOptionParent($select) {
      var $parentOption = getGroupFocusOption($select);
      return $select.find(".option-group-item").eq($parentOption.length ? $parentOption.index() : 0)
    }

    //获取当前焦点的option
    function getItemOption($parent) {

      $option = $parent.find(".option.focusActive");
      //当没有focus的时候，应该选择之前选过的选项
      if ($option.length == 0) {
        $option = $parent.find(".option.active");
      }
      return $option
    }
    //往右键
    function handlerGroupRight($select) {
      //content焦点变化
      setGroupItemFocus($select);
      //获得item option
      var $parent = getGroupItemOptionParent($select);
      var $option = getItemOption($parent);
      //item焦点变化
      $select.find(".option.focusActive").removeClass("focusActive");
      if ($option.length == 0) {
        $parent.find(".option").eq(0).addClass("focusActive");
      } else {
        $option.addClass("focusActive");
      }
    }

    //往左键
    function handlerGroupLeft($select) {
      //content焦点变化
      setGroupFocus($select);

      //group焦点变化
      hanlderGroupDir($select, "self");

      //item焦点变化
      $select.find(".option.focusActive").removeClass("focusActive");

    }

    //往上键-group
    function handlerGroupUp($select) {
      hanlderGroupDir($select, "prev");
    }

    //往下键-group
    function hanlderGroupDown($select) {
      hanlderGroupDir($select, "next");
    }

    //如果有滚动条那么就显示出来
    function scrollVisiable($content, $active) {
      var conHeight = $content.height();
      var conTop = $content.offset().top
      var activeTop = $active.offset().top;
      var activeHeight = $active.height() + (parseFloat($active.css("padding-top"), 10) || 0) + (parseFloat($active.css("padding-top"), 10) || 0)
      if (conHeight < (activeTop - conTop + activeHeight)) {
        $content.scrollTop((activeTop - conTop) - conHeight + activeHeight + $content.scrollTop())
      } else if (activeTop - conTop < 0) {
        $content.scrollTop((activeTop - conTop) + $content.scrollTop())
      }
    }
    //处理group上下和自己的方向
    function hanlderGroupDir($select, dir) {
      var $parentOption = getGroupFocusOption($select);
      if ($parentOption.length == 0) {
        $select.find(".option-group").first().trigger("mouseenter").addClass("focusActive")
      } else {
        $parentOption.trigger("mouseleave").removeClass("focusActive");
        switch (dir) {
          case "prev":
            if ($parentOption.prev().length) {
              $parentOption.prev().trigger("mouseenter").addClass("focusActive");
            } else {
              $select.find(".option-group").last().trigger("mouseenter").addClass("focusActive");
            }
            break;
          case "next":

            if ($parentOption.next().length) {
              $parentOption.next().trigger("mouseenter").addClass("focusActive");;
            } else {
              $select.find(".option-group").first().trigger("mouseenter").addClass("focusActive");;
            }
            break;
          default:
            $parentOption.trigger("mouseenter").addClass("focusActive");;
        }

      }
      scrollVisiable($select.find(".option-group-content"), $select.find(".option-group.focusActive"));
    }

    //处理item上下和自己的方向
    function hanlderItemDir($option, $parent, dir) {
      $parent.find(".option").removeClass("focusActive ");
      if ($option.length == 0) {
        $parent.find(".option").first().addClass("focusActive ");
      } else {
        var isMultiList = $parent.parents(".J-select-multi-list").length || $parent.parents(".J-select-multi-tree-list").length;
        var isMultiListoption = $option.parents(".J-select-multi-list").length || $option.parents(".J-select-multi-tree-list").length;
        switch (dir) {
          case "prev":
            if ($option.prev().length) {
              $option.prev().addClass("focusActive");
            } else if ($option.parents(".option-group").length && isMultiListoption && $option.parents(".option-group").prev().length) {
              $option.parents(".option-group").prev().find(".option").last().addClass("focusActive");
            } else {
              $parent.find(".option").last().addClass("focusActive");
            }
            break;
          case "next":
            if ($option.next().length) {
              $option.next().addClass("focusActive");
              //老行业样式,且不是项目zi'x
            } else if ($option.parents(".option-group").length && isMultiListoption && $option.parents(".option-group").next().length) {
              $option.parents(".option-group").next().find(".option").first().addClass("focusActive");
            } else {
              $parent.find(".option").first().addClass("focusActive");
            }
            break;
          default:
            $option.addClass("focusActive");
        }

      }

      if (isMultiList) {
        scrollVisiable($parent, $parent.find(".option.focusActive"));
      } else {
        scrollVisiable($parent.find(".J-select-option"), $parent.find(".option.focusActive"));
      }

    }

    //处理多列的方向问题
    function handlerMuitlDir(e, $select) {
      var currentDir = $select.data("keydir") || ".option-group";

      var skip = false;

      if (!currentDir) {
        setFoucsGroup($select);
      }

      // if (e.key == "ArrowRight") {
      if ((e.keyCode * 1 == 39)) {
        handlerGroupRight($select);
      } else if ((e.keyCode * 1 == 37)) {
        handlerGroupLeft($select);
        //确认
      } else {
        if (currentDir == ".option-group") {
          if ((e.keyCode * 1 == 38)) {
            handlerGroupUp($select)
          } else if ((e.keyCode * 1 == 40)) {
            hanlderGroupDown($select);
          } else {
            skip = true;
          }
        } else {
          skip = hanlderOptionDir(e, getGroupItemOptionParent($select));
        }

        return skip;
      }
    }

    //处理option的上下
    function hanlderOptionDir(e, $parent) {
      var $option = getItemOption($parent);
      var skip;
      if ((e.keyCode * 1 == 38)) {
        hanlderItemDir($option, $parent, "prev")
      } else if ((e.keyCode * 1 == 40)) {
        hanlderItemDir($option, $parent, "next")
      } else {
        skip = true;
      }
      return skip
    }

    //处理上下和左右入口
    function hanlderDir(e, $t) {
      //争对searchcity
      if ($t.data("skip")) {
        return;
      }
      var isRadio = $t.hasClass("form-radio");
      var isRadioParent = $t.find("input.form-radio").length;
      var ischeckBoxParent = $t.find("input[type='checkbox']").length;
      if ($t.parents(".J-select").length || $t.hasClass(".J-select")) {
        var $select = $t.parents(".J-select").length ? $t.parents(".J-select") : $t;
        var skip = false;
        if ((e.keyCode * 1 == 13)) {
          $select.find(".option.focusActive").data("keyupselect", true).trigger("click");
          $select.toggleClass("current");
          return;
          //空格选中
        }
        if ($select.hasClass("current")) {
          if (e.keyCode * 1 == 32) {
            $select.find(".option.focusActive").data("keyupselect", true).trigger("click");
            skip = false
          } else if ($select.hasClass("J-select-multi-list") || $select.hasClass("J-select-multi-tree-list")) {
            skip = handlerMuitlDir(e, $select);
            $select.find(".option.focusActive").data("keyupselect", true).trigger("click");

          } else {
            skip = hanlderOptionDir(e, $select)
            if (!$select.hasClass("J-mutil-select")) {
              $select.find(".option.focusActive").data("keyupselect", true).trigger("click");
            }
          }

        } else {
          if ((e.keyCode * 1 == 40)) {
            $select.addClass("current")
          }
        }

        if (!skip) {
          e.stopPropagation();
          e.preventDefault();
        }
      } else if (isRadio || isRadioParent || ischeckBoxParent) {

        if (e.keyCode * 1 == 32) {
          if (isRadioParent) {
            $t = $t.find("input.form-radio");
          } else if (ischeckBoxParent) {
            $t = $t.find("input[type='checkbox']");
          }
          $t.focus().trigger("click");
          e.stopPropagation();
          e.preventDefault();
          //上下键
        } else if (isRadio || isRadioParent) {

          if ((e.keyCode * 1 == 38) || (e.keyCode * 1 == 37)) {
            if ($t.prev().length) {
              $t.prev().focus().trigger("click");
            } else {
              $t.focus().trigger("click");
            }

            e.stopPropagation();
            e.preventDefault();

            $(".tabFocus").removeClass("tabFocus")
          } else if ((e.keyCode * 1 == 40) || (e.keyCode * 1 == 39)) {
            if ($t.next().length) {
              $t.next().focus().trigger("click");
            } else {
              $t.focus().trigger("click");
            }
            e.stopPropagation();
            e.preventDefault();

            $(".tabFocus").removeClass("tabFocus")
          }
        }
      }
    }

    //监听tab
    $input.on("keydown", function(e) {

      hanlderTab(e);
      //阻止默认行为
      var $t = $(this);
      var isRadio = $t.hasClass("form-radio");
      var isRadioParent = $t.find("input.form-radio").length;
      if ($t.parents(".J-select").length || $t.hasClass(".J-select")) {
        // if (e.key == "ArrowDown" || e.key == "ArrowUp") {
        if ((e.keyCode * 1 == 40) || (e.keyCode * 1 == 38)) {
          e.stopPropagation();
          e.preventDefault();
        }
      }
      if (isRadio || isRadioParent) {
        if ((e.keyCode * 1 == 40) || (e.keyCode * 1 == 38) || (e.keyCode * 1 == 37) || (e.keyCode * 1 == 39)) {
          // if(e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "ArrowLeft"  ||e.key == "ArrowRight"  ) {
          e.stopPropagation();
          e.preventDefault();
        }
        //单选框
        if (e.keyCode * 1 == 32) { //"space"
          e.stopPropagation();
          e.preventDefault();
        }
      }

    })

    $(document).on("keydown", function(e) {
      hanlderTab(e)
    })



    $input.on("keyup", function(e) {
      stopDocumentClick = true;
      hanlderDir(e, $TabTagert || $(this))
      stopDocumentClick = false;

    })

  }

  //移动端配置项----------------
  var uuid = 0

  function initConfig($this) {
    var offset = $this.data("offset")
    var position = $this.data("position")
    $this.data("data-ready-init", true);
    var id = "mobileselect" + uuid++;
    $this.attr("id", id);
    var config = {
      trigger: "#" + id,
      setValueOffset: offset == null ? 2 : offset,
      title: $this.find(".float-label").text().replace("*", ""),
      cancelText: $this.data("cancel") || "取消",
      ensureText: $this.data("ensure") || "确定",
      position: [position == null ? 0 : position, 0]
    }
    return config;
  }
  //移动端
  function initmobileselect($this) {

    var config = initConfig($this);

    if ($this.hasClass("J-select-multi-list") || $this.hasClass("J-select-multi-tree-list")) {
      var data = $this.data("data");
      var parentData = parseParentDate(data);
      var subData = parseSubDate(data);
      new MobileSelect($.extend(config, {
        wheels: [
          { data: parentData },
        ],

      }));
    } else if ($this.hasClass("J-mutil-select")) {
      var data = $this.data("data");
      var subData = parseSubDate(data);
      new MobileSelect($.extend(config, {
        multiple: true,
        wheels: [
          { data: subData }
        ]
      }));

    } else {
      var data = $this.data("data");
      var subData = parseSubDate(data);
      new MobileSelect($.extend(config, {
        wheels: [
          { data: subData }
        ]
      }));
    }
  }
  //----------------------------------------------------------
  function parseParentDate(data) {
    var newData = [];
    for (var i = 0; i < data.length; i++) {
      var item = data[i];

      var obj = { id: uuid++, value: item.name };
      if (item.data) {
        obj.childs = []

        for (var j = 0; j < item.data.length; j++) {
          var subItem = item.data[j];
          obj.childs.push({ id: uuid++, value: subItem.name, selectAll: item.selectAll });
        }
      }
      newData.push(obj)

    }
    return newData
  }
  //----------------------------------------------------------
  function parseSubDate(data) {
    var newData = []
    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var obj = { id: uuid++, value: item.value, name: item.name, selectAll: item.selectAll };
      newData.push(obj)

    }
    return newData
  }

  //移动端
  function initWapSelect() {
    //只有trigger 和 wheels 是必要参数  其他都是选填参数

    $(".J-select").each(function(params) {
      var $this = $(this);
      //如果没有MobileSelect或者没有使用J-mobile-select，将不会初始化移动端的样式
      if (!MobileSelect || !$(this).hasClass("J-mobile-select") || $(this).data("data-ready-init")) {
        return;
      }
      //提前初始化了
      if ($this.data("data-ready")) {

        initmobileselect($this);
      } else {
        $this.on("data-ready", function() {
          initmobileselect($this);
        })
      }
    })

    initMobileData();

    $(".J-mobile-select.staticData").trigger("data-ready").data("data-ready", true);

  }


  //-----------------------------------

  function initMobileData() {

    //静态项
    $(".J-mobile-select.staticData").each(function() {
      var data = []
      $(this).find(".option").each(function() {
        if ($(this).find(".J-select-all-ipt").length) {
          data.push({ value: $(this).data("value"), name: $(this).data("name"), selectAll: true })
        } else {
          data.push({ value: $(this).data("value"), name: $(this).data("name") })
        }

      })
      $(this).data("data", data);

    })
  }

  function initHoverMulti() {

    //对列项
    $(".J-select-multi-list,.J-select-multi-tree-list").each(function() {
      var $this = $(this);
      if ($this.data("data-ready")) {
        hover();
      } else {
        $this.on("data-ready", hover)
      }

      function hover() {
        if ($this.data("data-ready-hover-init")) {
          return;
        }
        $this.data("data-ready-hover-init", true);
        if ($.fn.mouseHover) {
          $this.mouseHover(".option-group", function() {
            $this.find(".showActive").removeClass("showActive")
            $(this).addClass("showActive")
            $this.find(".ipt-text").addClass("force-focus");
            var index = $(this).index();
            $this.find(".option-group-item").eq(index).addClass("showActive");
            resetWidth($this)
          }, function() {
            $this.find(".ipt-text").removeClass("force-focus");
          })
        }
        $this.find(".option-group").eq(0).addClass("showActive")
        $this.find(".option-group-item").eq(0).addClass("showActive")
        // $this.addClass("current")
        resetWidth($this)
        // $this.removeClass("current")
      }

    })
  }

  function getScrollbarWidth() {
    var $odiv = $("<div id='testScrollWidth' class='coustom-scroll' style='position:absolute;top:-100px;width:100px;height:100px;overflow-y:scroll'>&nbsp;</div>").appendTo("body"); //创建一个div
    var odiv = $odiv[0]
    var scrollbarWidth = odiv.offsetWidth - odiv.clientWidth; //相减
    $odiv.remove(); //移除创建的div
    return scrollbarWidth; //返回滚动条宽度
  }
  var scrollbarWidth = getScrollbarWidth();

  function resetWidth($this) {
    if ($(window).width() < 992) {
      return;
    }
    var minWidth = $this.width();
    var minHeight = $this.find(">.J-select-option").height();
    var maxWidth = $this.parents(".cistern").width() + $this.parents(".cistern").offset().left - $this.offset().left; //不能超过可见区域

    $this.find(">.J-select-option").width(maxWidth);

    var $left = $this.find(">.J-select-option .option-group-content");

    var $right = $this.find(">.J-select-option .option-group-item-content");
    $right.removeClass("allowBreakWord").removeClass("minHeight");
    $left.removeClass("allowBreakWord");
    var addWidth = $right.width() + $left.width() + 1;
    var fixWidth = 0;

    if (baseLib.browserVersion() == "11" || baseLib.browserVersion() == "10") {
      fixWidth = scrollbarWidth
    }
    if (minHeight > $right.height()) {
      $right.addClass("minHeight")
    }
    if ($right.width() >= maxWidth / 2) {
      $right.addClass("allowBreakWord")
    }
    if ($left.width() >= maxWidth / 2) {
      $left.addClass("allowBreakWord")
    }
    if (addWidth > maxWidth) {
      $right.width(maxWidth - Math.min($left.width(), maxWidth / 2));
    } else if (addWidth < minWidth) {
      $this.find(">.J-select-option").width(minWidth + fixWidth);
      $right.width(minWidth - $left.width());
    } else {
      $this.find(">.J-select-option").width(addWidth + fixWidth);
    }

  }

  $(function() {
    if ($(window).width() < 992) {
      initWapSelect();
    } else {
      initFormKey();
    }
    initSelect();
    initHoverMulti()

    $(".form-group").each(function(idx) {
      $(this).find(".ipt-wrap").addClass("level" + idx);
    })
  })


})(RBT.dom, window.undefined);