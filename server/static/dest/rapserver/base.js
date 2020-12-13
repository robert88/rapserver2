function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 * 清空两边空白
 *
 * */
String.prototype.trim = function () {
  return this.toString().replace(/^\s+|\s+$/, "");
};

Number.prototype.trim = function () {
  return this.toString().trim();
};

String.prototype.seam = function () {
  return this.replace(/\\/g, "\\\\").replace(/(\n|\r)+/g, "\\n").replace(/("|')/g, "\\\$1").replace(/\n/g, "\"+\n\"");
};
/*
 * 字符串转为浮点数字
 *
 * */


String.prototype.toFloat = function (defaultValue) {
  return parseFloat(this, 10) || defaultValue || 0;
};

Number.prototype.toFloat = function (defaultValue) {
  return this.toString().toFloat(defaultValue);
};
/*
 * 字符串转为整型数字
 *
 * */


String.prototype.toInt = function (defaultValue) {
  return parseInt(this, 10) || defaultValue || 0;
};

Number.prototype.toInt = function (defaultValue) {
  return this.toString().toInt(defaultValue);
};
/*
 * 数字转字符串
 *
 * */


String.prototype.tpl = function () {
  var arg = arguments;
  var that = this;

  for (var i = 0; i < arg.length; i++) {
    that = that.replace(new RegExp('\\{' + i + '\\}', "g"), arg[i]);
  }

  return that;
};
/*
 * 数字转字符串
 *
 * */


String.prototype.format = function (parten) {
  return this.toFloat().format(parten);
};
/*
 * 数字转字符串###,##.##
 *小数点超过4位，0.0001将会被转化为0
 * 整数不超过16位
 * */


Number.prototype.format = function (parten) {
  var pointIdx = parten.lastIndexOf(".");
  var accuracy = pointIdx != -1 ? parten.length - pointIdx - 1 : 0;
  var result = (Math.round(this * Math.pow(10, accuracy)) / Math.pow(10, accuracy) + Math.pow(10, -(accuracy + 1))).toString();
  var pointStrIdx = result.lastIndexOf(".");

  if (pointStrIdx == -1) {
    pointStrIdx = result.length;
  }

  var prefixStr = result.slice(0, pointStrIdx);
  var suffixStr = result.slice(pointStrIdx, result.length);
  var prefixParten;

  if (~pointIdx) {
    prefixParten = parten.slice(0, pointIdx);
  } else {
    prefixParten = parten;
  }

  var str = [];
  /*高位在前，低位在后*/

  for (var i = prefixParten.length - 1, j = prefixStr.length - 1; i >= 0 && j >= 0; i--) {
    if (prefixParten[i] == "#") {
      str.unshift(prefixStr[j]);
      j--;
    } else {
      str.unshift(prefixParten[i]);
    }
  }
  /*补全高位*/


  for (; j >= 0; j--) {
    str.unshift(prefixStr[j]);
  }
  /*补小数点*/


  for (i = 0; i < accuracy + 1 && accuracy; i++) {
    str.push(suffixStr[i]);
  }

  return str.join("");
};
/*
 * 转正则表达式
 *
 * */


String.prototype.toReg = function () {
  return this.replace(/(\/|\.|\)|\(|\]|\[|\}|\{|\||\?|\+|\*|\^|\$)/, "\\$1");
};
/*
 * 转url
 *
 * */


String.prototype.toURI = function () {
  return this.replace(/^\s+|\s+$/g, "").replace(/"|'/g, "").replace(/\/$/g, "").replace(/\\/g, "/").replace(/([^\/])\/+/g, "$1/").replace(/(^http:|^https:)/g, function (m, m1) {
    return m1 + "/";
  });
};
/*
 * 转html
 *
 * */


String.prototype.toHtml = function () {
  return this.replace(/&gt;/gm, ">").replace(/&lt;/gm, "<").replace(/&nbsp;/gm, " ").replace(/&apos;/gm, "").replace(/&quot;/gm, "").replace(/&amp;/gm, "");
};
/*
 * 转html转string
 *
 * */


String.prototype.htmlToString = function () {
  return this.replace(/>/gm, "&gt;").replace(/</gm, "&lt;");
};

String.prototype.oneUp = function () {
  return this.replace(this[0], this[0].toUpperCase());
};

String.prototype.oneDown = function () {
  return this.replace(this[0], this[0].toLowerCase());
};

String.prototype.toLowerBySplit = function (type) {
  type = type || "_";
  var b = this.split(type);

  for (var i = 0; i < b.length; i++) {
    if (b[i]) {
      b[i] = b[i].oneUp();
    }
  }

  return b.join("");
};
/**
 * @introduction：返回格式化的字符串
 * @param {string|Date} date日期字符串或者对象
 * @param {string} outType 格式化 yyyy MM dd hh mm ss(年月日时分秒)（yyyy-MM-dd）,outType=="object"表示返回Date对象
 * @return {string}  返回格式化的时间字符串
 */


String.prototype.toDate = function () {
  var that = this.trim();
  var tm, td;
  var checkDate = new Date(this);
  var dateToStr;

  if (checkDate instanceof Date && checkDate != "Invalid Date" && checkDate.toString().indexOf("aN") == -1 && checkDate.toString().indexOf("NaN") == -1) {
    return checkDate;
  } else {
    if (/^\d+$/g.test(that)) {
      //2016080901表示时间字符串
      if (that.length <= 10) {
        that = that.perFill("2000010100");
        tm = that.slice(4, 6) == "00" ? "01" : that.slice(4, 6);
        td = that.slice(6, 8) == "00" ? "01" : that.slice(6, 8);
        return new Date(that.slice(0, 4) + "/" + tm + "/" + td); //认为是时间戳
      } else if (that.length < 14) {
        return new Date(that * 1); //20160809010908
      } else {
        that = that.perFill("20000101000000");
        tm = that.slice(4, 6) == "00" ? "01" : that.slice(4, 6);
        td = that.slice(6, 8) == "00" ? "01" : that.slice(6, 8);
        return new Date(that.slice(0, 4) + "/" + tm + "/" + td + "/" + that.slice(8, 10) + "/" + that.slice(10, 12) + "/" + that.slice(12, 14));
      }
    } else if (this.trim() == "") {
      return new Date();
    } else {
      dateToStr = this;
    }
  }

  dateToStr = dateToStr.replace("Jan", 1).replace("Feb", 2).replace("Mar", 3).replace("Apr", 4).replace("May", 5).replace("Jun", 6).replace("Jul", 7).replace("Aug", 8).replace("Sep", 9).replace("Oct", 10).replace("Nov", 11).replace("Dec", 12); //去掉非数字部分

  var t = dateToStr.replace(/\D+/g, " ").replace(/^\s+|\s+$/, "").split(/\s+/); //Thu Sep 10 2015 22:30:38 GMT+0800 (中国标准时间)

  if (dateToStr.indexOf("GMT+0800") > 0) {
    date = [t[2], t[0], t[1], t[3], t[4], t[5]]; //"Thu, 17 Sep 2015 08:28:21 GMT"
  } else if (/GMT$/.test(dateToStr)) {
    date = [t[2], t[1], t[0], t[3], t[4], t[5]]; //"Thu Nov 19 00:00:00 CST 2015"
  } else if (dateToStr.indexOf("CST") > 0) {
    date = [t[5], t[0], t[1], t[2], t[3], t[4]]; //"2015/9/17 下午4:28:55"
  } else {
    date = t;
  }

  var y = ("" + date[0]).fill("2000"); //年

  var M = ("" + date[1]).fill("00"); //月（大写）

  var d = ("" + date[2]).fill("00"); //日

  var h = ("" + date[3]).fill("00"); //时

  var m = ("" + date[4]).fill("00"); //分

  var s = ("" + date[5]).fill("00"); //秒

  return new Date(y + "/" + M + "/" + d + " " + h + ":" + m + ":" + s);
};
/*
* 向后填充
* */


String.prototype.fill = function (perfix) {
  var len = perfix.length - this.length;

  if (len < 0) {
    return this + "";
  } else {
    return perfix.slice(0, len) + this;
  }
};
/*
 * 向前填充
 * */


String.prototype.perFill = function (perfix) {
  var len = this.length;

  if (len < 0) {
    return this + "";
  } else {
    return this + perfix.slice(len, perfix.length);
  }
};
/*
 * 格式化时间
 * */


Date.prototype.format = function (a, b) {
  if (b == "12") {
    return a.replace("yy", this.getFullYear().toString().fill("2000")).replace("MM", (this.getMonth() + 1).toString().fill("00")).replace("dd", this.getDate().toString().fill("00")).replace("hh", (this.getHours() % 12).toString().fill("00")).replace("mm", this.getMinutes().toString().fill("00")).replace("ss", this.getSeconds().toString().fill("00")).replace("ampm", this.getHours() < 12 ? "AM" : "PM");
  } else {
    return a.replace("yy", this.getFullYear().toString().fill("2000")).replace("MM", (this.getMonth() + 1).toString().fill("00")).replace("dd", this.getDate().toString().fill("00")).replace("hh", this.getHours().toString().fill("00")).replace("mm", this.getMinutes().toString().fill("00")).replace("ss", this.getSeconds().toString().fill("00"));
  }
};
/*
 *加密
 * */


String.prototype.ENC = function (dir, notEncStr) {
  if (notEncStr) {
    notEncStr = notEncStr.split("");
  }

  var that = this;
  dir = dir || 1;
  var ret = [];

  for (var i = 0; i < that.length; i++) {
    if (that[i] == "") {
      ret.push("");
      continue;
    }

    if (notEncStr && notEncStr.indexOf(that[i])) {
      ret.push(that[i].charCodeAt(i));
      continue;
    } else {
      ret.push("00" + (that.charCodeAt(i) + 1 * dir).toString(16).slice(-4));
    }
  }

  return unescape("%u" + ret.join("%u"));
};
/*
/*
* 转换为web能识别的日期格式
* */


Date.prototype.toString = function () {
  return this.format("yy/MM/dd hh:mm:ss");
};

Date.prototype.toDate = function () {
  return this;
};

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (fn) {
    for (var i = 0; i < this.length; i++) {
      if (fn.call(this[i], this[i], i) === false) {
        break;
      }
    }
  };
}

;
;

(function () {
  window.RBT = window.RBT || {};

  RBT.each = function (str, fn) {
    if (str.constructor === Array && Array.prototype.forEach) {
      str.forEach(function (val, idx) {
        if (fn.call(val, val, idx) === false) {
          return false;
        }
      });
    } else if (str.length != null) {
      for (var i = 0; i < str.length; i++) {
        if (fn.call(str[i], str[i], i) === false) {
          break;
        }
      }
    } else if (_typeof(str) == "object") {
      for (var key in str) {
        if (fn.call(str[key], str[key], key) === false) {
          break;
        }
      }
    }
  };
})();

;
;

(function () {
  window.RBT = window.RBT || {};

  RBT.extend = function () {
    var deep, target, src;
    var len = arguments.length;
    var i = 0;

    if (len == 1) {
      target = this;
    } else {
      if (typeof arguments[0] === "boolean") {
        deep = true;
        target = arguments[1];
        i = 2;
      } else {
        target = arguments[0];
        i = 1;
      }
    }

    for (; i < len; i++) {
      src = arguments[i];

      for (var j in src) {
        if (deep && src[j] && _typeof(src[j]) === "object" && !src[j].nodeType) {
          var value = arguments.callee(deep, target[j] || (src[j].length != null ? [] : {}), src[j]);

          if (value != null) {
            target[j] = value;
          }
        } else {
          if (src[j] != null) {
            target[j] = src[j];
          }
        }
      }
    }

    return target;
  };
})();

; // https://blog.csdn.net/qq_41455420/article/details/79549599

/**
 客户端类型：pc wap tool bot unkown
 系统类型：mac window Ubuntu FreeBSD linux ios android blackBerry windowsCE windowPhone symbian unkown
 系统位数：64  32
 系统版本：series unkown
 浏览器 ： ie chrome safari opera firefox  LotusNotes Lynx konqueror unkown
 浏览器版本： series unkown
 浏览器厂家：apple google firefox  opera 360  遨游 htc 世界之窗 SAMSUNG qq uc sogou Avant Xoom hp Nexus outlook utlookExpress Vivaldi AppStore Silk iTunes Thunderbird OmniWeb Camino SeaMonkey Flock OperaMini OperaCoast blackberry konqueror LotusNotes  Lynx unkown

 //得到统一的格式
 客户端类型/系统类型/系统位数/系统版本/浏览器/浏览器版本/浏览器厂家
 */

function matchUserAgent(userAge) {
  var startReg = /^\s*([a-zA-Z-\s_]+)\/\d+\.\d+\s+\(([^\)]+)\)/g;
  var match = userAge.match(startReg);

  if (match && match[0]) {
    var matchStr = match[0];
  } else {
    matchStr = userAge;
  }

  var isMac = matchStr.match(/Mac\sOS\sX\s(\d+\D\d+(\D\d+)?)/i) || matchStr.match(/Mac\sOS\s(X)/i);
  var isWindow = matchStr.match(/Windows\sNT\s(\d+\D\d+(\D\d+)?)/i) || matchStr.match(/Windows\s*(\d+(\D\d+)?)/i) || userAge.match(/Windows\s*(XP)/i);
  var isIphone = /\(iPhone;/i.test(matchStr);
  var isIpad = /\(iPad;/i.test(matchStr);
  var isIpod = /\(iPod;/i.test(matchStr);
  var applemail = userAge.match(/AppleWebKit\/(533\.18\.1)/i);
  var OmniWeb = userAge.match(/OmniWeb\/v(\d+(\D\d+)?(\w)?)/i);
  var iphoneVersion = matchStr.match(/OS\s(\d+\D\d+(\D\d+)?)/i) || matchStr.match(/Mac\sOS\s(X)/i);
  var isAndroid = matchStr.match(/android-?\s*(\d+\D\d+(\D\d+)?)/i) || userAge.match(/Linux\s(armv7l)/i);
  var BlackBerry = matchStr.match(/BlackBerry\s(\d+(\D\d+)?)/i) || userAge.match(/BB10;/i);
  var SymbianOS = /SymbianOS/i.test(matchStr);
  var WindowsPhone = userAge.match(/Windows\sPhone\sOS\s*\/?\s*(\d+\D\d+(\D\d+)?)/) || userAge.match(/Windows\sPhone\s*(\d+\D\d+(\D\d+)?)/);
  var WindowsCE = userAge.match(/Windows\s(CE)/);
  var hpwOS = userAge.match(/hpwOS\s*\/\s*(\d+\D\d+(\D\d+)?)/);
  var linux = userAge.match(/linux\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i) || userAge.match(/Linux\s(x86_64)/i) || userAge.match(/Linux\s(i\d+)/i);
  var FreeBSD = userAge.match(/FreeBSD\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var Ubuntu = userAge.match(/Ubuntu\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var isChrome = userAge.match(/Chrome\s*\/\s*(\d+\D\d+(\D\d+)?)/i);
  var chromeMobile = userAge.match(/CrMo\s*\/\s*(\d+\D\d+(\D\d+)?)/i) || userAge.match(/CriOS\s*\/\s*(\d+\D\d+(\D\d+)?)/i) || userAge.match(/CrOS\si686\s*(\d+\D\d+(\D\d+)?)/i);
  var isIe = matchStr.match(/MSIE\s(\d+(\D\d+)?(\w)?)/i);
  var isIe11 = /Trident/i.test(matchStr) && /rv:11/i.test(matchStr) || matchStr.match(/\bIE\s11\b/i);
  var edge = userAge.match(/Edge\s*\/\s*(\d+\D\d+(\D\d+)?)/);
  var Opera = matchStr.match(/Opera\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i) || userAge.match(/OPR\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var OperaMini = userAge.match(/Opera\sMini\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var OperaCoast = userAge.match(/Coast\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var Safari = userAge.match(/Safari\s*\/\s*(\d+\D\d+(\D\d+)?)/);
  var Version = userAge.match(/Version\s*\/\s*(\d+\D\d+(\D\d+)?)/);
  var fireFox = userAge.match(/Firefox\s*\/\s*(\d+\D\d+(\D\d+)?)/) || userAge.match(/FxiOS\s*\/\s*(\d+\D\d+(\D\d+)?)/);
  var Camino = userAge.match(/Camino\s*\/\s*(\d+\D\d+(\D\d+)?)/);
  var SAMSUNG = userAge.match(/SAMSUNG/);
  var SeaMonkey = userAge.match(/SeaMonkey\s*\/\s*(\d+\D\d+(\D\d+)?)/);
  var Flock = userAge.match(/Flock\s*\/\s*(\d+\D\d+(\D\d+)?)/);
  var BrowserNG = userAge.match(/BrowserNG\s*\/\s*(\d+\D\d+(\D\d+)?)/);
  var Presto = userAge.match(/Presto\s*\/\s*(\d+\D\d+(\D\d+)?)/);
  var is64 = /\b(WOW64|Win64|x64)\b/.test(userAge);
  var IEMobile = matchStr.match(/IEMobile\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var isMobile = /Mobile/i.test(userAge);
  var outlook = userAge.match(/MSOffice\s*(\d+(\D\d+)?)/i);
  var OutlookExpress = userAge.match(/Outlook-Express\s*\/\s*(\d+(\D\d+)?)/i);
  var is360 = /360SE/i.test(matchStr) || /360EE/i.test(userAge);
  var aoyou = /Maxthon/i.test(matchStr);
  var theWord = /The\sworld/i.test(matchStr);
  var qq = /TencentTraveler/i.test(matchStr) || /MQQBrowser/i.test(userAge);
  var sogou = /MetaSr/i.test(matchStr);
  var Avant = /Avant/i.test(matchStr);
  var Xoom = /Xoom/i.test(matchStr);
  var Nexus = /Nexus/i.test(matchStr);
  var htc = /htc/i.test(userAge);
  var isUc = userAge.match(/UCWEB\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i) || /\bUC\b/.test(userAge);
  var Vivaldi = userAge.match(/Vivaldi\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var AppStore = userAge.match(/Mac(AppStore)\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var iTunes = userAge.match(/(iTunes)\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var Silk = userAge.match(/(Silk)\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var Thunderbird = userAge.match(/Thunderbird\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var konqueror = userAge.match(/konqueror\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
  var isProxy = userAge.match(/\(via\s+(\w+\.\w+)\)/i); //端类别

  var type = "unkown";

  if (isIphone || isIpad || isIpod || isAndroid || isMobile || SymbianOS || BlackBerry || IEMobile || isUc || hpwOS || BrowserNG || chromeMobile || OperaMini || SAMSUNG) {
    type = "wap";
  } else if (isMac || isWindow || linux) {
    type = "pc";
  } //系统类别


  var systemType = "unkown";

  if (isMac && !(type == "wap")) {
    systemType = "mac";
  } else if (isWindow) {
    systemType = "window";
  } else if (Ubuntu) {
    systemType = "Ubuntu";
  } else if (FreeBSD) {
    systemType = "FreeBSD";
  } else if ((hpwOS || linux) && !isAndroid) {
    systemType = "linux";
  } else if (type == "wap") {
    if (isIphone || isIpad || isIpod) {
      systemType = "ios";
    } else if (BlackBerry) {
      systemType = "blackBerry";
    } else if (WindowsPhone) {
      systemType = "windowPhone";
    } else if (WindowsCE) {
      systemType = "windowsCE";
    } else if (SymbianOS || IEMobile || BrowserNG) {
      systemType = "symbian";
    } else {
      systemType = "android";
    }
  } //cpu位数


  var cpuBit = is64 ? "64" : "32"; //系统版本

  var systemVersion = "unkown";

  if (systemType != "unkown") {
    systemVersion = isWindow && isWindow[1] || (isIphone || isIpad || isIpod) && iphoneVersion && iphoneVersion[1] || isMac && isMac[1] || BlackBerry && BlackBerry[1] || WindowsPhone && WindowsPhone[1] || BrowserNG && BrowserNG[1] || hpwOS && hpwOS[1] || chromeMobile && chromeMobile[1] || isAndroid && isAndroid[1] || WindowsPhone && WindowsPhone[1] || WindowsCE && WindowsCE[1] || FreeBSD && FreeBSD[1] || Ubuntu && Ubuntu[1] || linux && linux[1] || "unkown";
  } //浏览器类别


  var browser = "unkown";

  if (isIe || isIe11 || edge || IEMobile || SymbianOS) {
    browser = "ie";
  } else if (Opera || Presto || OperaCoast) {
    browser = "opera";
    isChrome = null;
    Safari = null;
  } else if (isChrome || chromeMobile || isUc) {
    browser = "chrome";
  } else if (fireFox || Camino || SeaMonkey || Flock) {
    browser = "firefox";
  } else if (isIphone || isIpad || isIpod || Safari || applemail) {
    browser = "safari";
  }

  var browserVersion = "unkown";

  if (browser != "unkown") {
    browserVersion = isIe && isIe[1] || isIe11 && "11" || edge && edge[1] || isChrome && isChrome[1] || chromeMobile && chromeMobile[1] || applemail && applemail[1] || fireFox && fireFox[1] || isUc && isUc[1] || Presto && Version && Version[1] || OperaCoast && OperaCoast[1] || Opera && Opera[1] || konqueror && konqueror[1] || browser == "safari" && Version && Version[1] || OmniWeb && OmniWeb[1] || Safari && Safari[1] || "unkown";
  } //


  var coop = isProxy && "proxy_" + isProxy[1].replace(/\./g, "_") || is360 && "360" || isUc && "uc" || aoyou && "遨游" || htc && "htc" || theWord && "世界之窗" || SAMSUNG && "SAMSUNG" || qq && "qq" || sogou && "sogou" || Avant && "Avant" || Nexus && "Nexus" || Xoom && "Xoom" || hpwOS && "hp" || outlook && "outlook" + outlook[1] || OutlookExpress && "OutlookExpress" || browser == "ie" && "microsoft" || Vivaldi && "Vivaldi" || browser == "chrome" && "google" || applemail && "applemail" || AppStore && "AppStore" || Silk && "Silk" || iTunes && "iTunes" || Thunderbird && "Thunderbird" || OmniWeb && "OmniWeb" || Camino && "Camino" || SeaMonkey && "SeaMonkey" || Flock && "Flock" || browser == "firefox" && "firefox" || OperaMini && "OperaMini" || OperaCoast && "OperaCoast" || browser == "opera" && "opera" || browser == "safari" && "apple" || konqueror && "konqueror" || "unkown"; //特殊

  if (type == "unkown") {
    var isLN = userAge.match(/Lotus-Notes\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
    var Lynx = userAge.match(/Lynx\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);

    if (Lynx) {
      type = "wap";
      systemType = "window";
    } else if (isLN) {
      type = "pc";
    }

    if (systemType == "unkown") {
      if (isLN) {
        systemType = "window";
      } else if (Lynx) {
        systemType = "android";
      }
    }

    if (browser == "unkown") {
      if (isLN) {
        browser = "LotusNotes";
      } else if (Lynx) {
        browser = "Lynx";
      }
    }

    if (browserVersion == "unkown") {
      browserVersion = Lynx && Lynx[1] || isLN && isLN[1] || browserVersion;
    }

    if (coop == "unkown") {
      coop = isLN && "LotusNotes" || Lynx && "Lynx" || coop;
    }
  }

  if (type == "unkown") {
    var AdobeAIR = userAge.match(/(Adobe)AIR\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
    var curl = userAge.match(/(curl)\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
    var ThumbSniperBot = userAge.match(/(ThumbSniper)/i);
    var bot = Thunderbird || Silk || AdobeAIR || curl || ThumbSniperBot || userAge.match(/^(Java)\s*\/?\s*([0-9-\._]+)$/i) || userAge.match(/^(Phantom)\.js/i) || userAge.match(/^(python)-requests\s*\/?\s*([0-9-\._]+)$/i) || userAge.match(/^(Wget)\s*\/?\s*([0-9-\._]+)$/i) || userAge.match(/^(Apache)-HttpClient/i);
    type = bot && "tool" || type;
    coop = bot && bot[1] || coop;
  }

  var googleBot = userAge.match(/(Google)bot/i) || userAge.match(/(Google)\sWeb\s Preview/i) || userAge.match(/Mediapartners-(Google)/i) || userAge.match(/AdsBot-(Google)/i);
  var YahooBot = userAge.match(/(Yahoo)!\sSlurp/i);
  var AppleBot = userAge.match(/(Apple)Bot/i);
  var BingBot = userAge.match(/(Bing)Preview/i) || userAge.match(/(bing)bot/i);
  var WordPressBot = userAge.match(/(WordPress)\.com\s mShots/i);
  var SeznamBot = userAge.match(/(Seznam)\sscreenshot-generator/i);
  var facebookBot = userAge.match(/(facebook)externalhit/i);
  var ExaBot = userAge.match(/(Exabot)-Thumbnails/i);
  var YandexBot = userAge.match(/(Yandex)Market/i) || userAge.match(/(Yandex)MobileBot/i) || userAge.match(/(Yandex)Bot/i);
  var AhrefsBot = userAge.match(/(Ahrefs)Bot/i);
  var AskBot = userAge.match(/(Ask)\sJeeves\/Teoma/i);
  var isBot = googleBot || YahooBot || AppleBot || BingBot || WordPressBot || SeznamBot || facebookBot || ExaBot || YandexBot || AhrefsBot || AskBot;

  if (isBot) {
    type = isBot && "bot";
    coop = isBot && isBot[1];
  }

  return type + "/" + systemType + "/" + cpuBit + "/" + systemVersion + "/" + browser + "/" + browserVersion + "/" + coop;
}

RBT.userAgent = matchUserAgent(navigator.userAgent);
;
/*
	AUTHOR : robert
	GLOBAL : 全局模块 RBT 对外接口 dom
	RETURN : RBT.dom的实例
	DEPENDENCE : RBT.each，RBT.extend
*/

;

(function () {
  window.RBT = window.RBT || {};
  var _each = RBT.each;
  var extend = RBT.extend;

  function Dom(selector, context) {
    if (typeof selector == "function") {
      if (document.readyState !== "complete" || document.readyState !== "loaded") {
        Array.prototype.push.apply(this, [document]);
        this.on("DOMContentLoaded", selector);
      } else {
        selector();
      }
    } else {
      var dom = _find(selector, context);

      Array.prototype.push.apply(this, dom);
      this.selector = selector;
      return this;
    }
  }

  RBT.dom = function (selector, context) {
    return new Dom(selector, context);
  }; //提前检测代码优化


  var g_listner = "";
  var g_removeListner = "";
  var g_type = "";

  if (window.addEventListener) {
    g_listner = "addEventListener";
    g_removeListner = "removeEventListener";
  } else if (window.attachEvent) {
    g_listner = "attachEvent";
    g_removeListner = "detachEvent";
    g_type = "on";
  }

  var g_touch = /touchstart|touchend|touchmove/g; //添加事件监听

  function bind(e, fn, keep, val, index) {
    //支持平板touch事件
    if (g_touch.test(e.type)) {
      e = e.originalEvent.touches[0];
    }

    var fnRet = fn.call(val, e, index); //如果设置了keep，那就允许默认行为 和事件传播

    if (keep) {
      fnRet === false;
    }

    if (fnRet === false) {
      e.stopPropagation();
      e.preventDefault();
    }

    return fnRet;
  } //获取css样式


  function getCss(elem, key) {
    //将命名变成驼峰式命名
    var varKey = setName(key);
    var computedStyle = getComputedStyle();

    if (elem.style[varKey]) {
      return elem.style[varKey]; //兼容性更好
    } else if (computedStyle || elem.currentStyle) {
      var value = computedStyle(elem, null).getPropertyValue(key);

      if (RBT.userAgent.split("/")[4] == "ie") {
        if (key == "width") {
          value += computedStyle(elem, null).getPropertyValue("padding-left").toFloat() + computedStyle(elem, null).getPropertyValue("padding-right").toFloat();
        } else if (key == "height") {
          value += computedStyle(elem, null).getPropertyValue("padding-top").toFloat() + computedStyle(elem, null).getPropertyValue("padding-top").toFloat();
        }
      }

      return value || elem.currentStyle && elem.currentStyle[varKey];
    }
  }

  function getComputedStyle() {
    return document.defaultView && document.defaultView.getComputedStyle;
  } //设置css样式


  function setCss(elem, key, value) {
    key = setName(key);

    if (/^top|left|bottom|right|width|height$/) {
      if (typeof value == "number" || value && /^\d+$/.test(value)) {
        value = value + "px";
      }
    }

    elem.style[key] = value;
  } //将命名变成驼峰式命名


  function setName(name) {
    return name.replace(/-(\w)/g, function (c, m1) {
      return m1.toUpperCase();
    });
  } //将事件代理


  function findDelegateDom(target, parentNode, matchNode) {
    if (!matchNode.length) {
      return null;
    }

    for (var i = 0; i < matchNode.length; i++) {
      if (target == matchNode[i]) {
        return {
          dom: matchNode[i],
          index: i
        };
      }
    }

    if (target.parentNode != null && target.parentNode != parentNode) {
      return findDelegateDom(target.parentNode, parentNode, matchNode);
    }

    return null;
  }

  function findDom(str, context, level) {
    var isTag = str.match(/^\s*<(\w+)\s*[^>]*>([\u0000-\uFFFF]*?)<\/\w+>$/);
    var domList = [];

    if (isTag) {
      var newDom = document.createElement(isTag[1]);

      if (isTag[2]) {
        newDom.innerHTML = isTag[1];
      }

      return [newDom];
    }

    if (document.querySelector) {
      var newStr;

      if (/^>.*/.test(str)) {
        newStr = str.slice(1);
      } else {
        newStr = str;
      }

      if (context && context.querySelectorAll) {
        domList = context.querySelectorAll(newStr);
      } else {
        domList = document.querySelectorAll(newStr);
      }

      if (/^>.*/.test(str)) {
        domList = _filter(domList, function (val, idx) {
          return val.parentNode == context;
        });
      }

      return domList;
    } else {
      if (/^#.*/.test(str)) {
        domList.push(document.getElementById(str.slice(1)));
      } else if (/^\..*/.test(str)) {
        domList = document.getElementsByClassName(str.slice(1));
      } else if (/^>.*/.test(str)) {
        //只比较一级父类
        domList = findDom(str.slice(1), context, true);
      } else {
        domList = document.getElementsByTagName(str);
      }
    }

    if (context) {
      domList = _filter(domList, function (val, idx) {
        if (level) {
          return val.parentNode == context;
        } else {
          return isParent(val, context);
        }
      });
    }

    return domList;
  }

  function isParent(ele, parent) {
    if (ele.parentNode != null && ele != document) {
      if (ele.parentNode == parent) {
        return true;
      } else {
        return isParent(ele.parentNode, parent);
      }
    } else {
      return false;
    }
  }
  /*context必须是dom*/


  function _find(str, context) {
    var dom = [];

    if (typeof str == "string") {
      var tempDom;

      if (context && context.nodeType == Node.ELEMENT_NODE) {
        tempDom = findDom(str, context);
      } else {
        tempDom = findDom(str);
      }

      if (tempDom) {
        if (tempDom.length == null) {
          dom.push(tempDom);
        } else {
          for (var i = 0; i < tempDom.length; i++) {
            dom.push(tempDom[i]);
          }
        }
      }

      tempDom = null;
    } else if (_typeof(str) == "object") {
      if (str.nodeType || str == window || str == document) {
        dom.push(str);
      } else if (str.constructor == Dom) {
        return str;
      }
    }

    return dom;
  }

  function testAttr(name) {
    var dom = document.createElement("div");
    dom.setAttribute(name, "test");
    return dom.getAttribute(name) == "test";
  }

  var attrMap = {
    "className": "className",
    "class": "className"
  };

  if (testAttr("class")) {
    attrMap["className"] = "class";
    attrMap["class"] = "class";
  }

  function getAttr(ele, name) {
    name = attrMap[name] || name;
    return ele.getAttribute(name) || "";
  }

  function setAttr(ele, name, value) {
    name = attrMap[name] || name;
    ele.setAttribute(name, value && value.trim && value.trim().replace(/\s+/, " ") || value);
  }

  function findParentDom(ele, parentSelector, retArr) {
    if (ele.parentNode == null || retArr.indexOf(ele.parentNode) != -1 || ele.parentNode == document) {
      return;
    }

    var id = "#" + ele.parentNode.id;
    var className = "." + getAttr(ele.parentNode, "className").replace(/^\s+|\s+$/g, "").replace(/\s+/g, ".");
    var attrName = ele.parentNode.getAttributeNames();
    var attrStr = false;

    _each(attrName, function (val) {
      if (val == "id" || val == "className" || val == "class") {
        return;
      }

      var value = getAttr(ele.parentNode, val);

      if ("[" + val + "=" + value + "]" == parentSelector || "[" + val + "='" + value + "']" == parentSelector || '[' + val + '="' + value + '"]' == parentSelector) {
        attrStr = true;
        return false;
      }
    });

    if (parentSelector == id || className.indexOf(parentSelector) != -1 || attrStr) {
      retArr.push(ele.parentNode);
    }

    findParentDom(ele.parentNode, parentSelector, retArr);
  }

  function fireEvent(element, event) {
    var evt;
    var fireOk;

    if (document.createEventObject) {
      // IE浏览器支持fireEvent方法
      evt = document.createEventObject();
      fireOk = element.fireEvent('on' + event, evt); //有些事件不支持原生的冒泡
    } else {
      // 其他标准浏览器使用dispatchEvent方法
      evt = document.createEvent('HTMLEvents');
      evt.initEvent(event, true, true);
      fireOk = element.dispatchEvent(evt);
    } //事件没有触发
    // if (!fireOk) {
    //   loopEvent(Object.assign({ stopPropagation: function() {}, preventDefault: function() {} }, evt, {
    //     target: element,
    //     type: event
    //   }), element, event);
    // }

  } // //事件冒泡
  // function loopEvent(evt, element, event) {
  //   var ret;
  //   if (element && element.eventMap && element.eventMap[event]) {
  //     var len = element.eventMap[event].length;
  //     for (var i = 0; i < len; i++) {
  //       if (element.eventMap[event][i].call(element, evt) === false) {
  //         ret = false
  //       }
  //     }
  //   }
  //   if (ret !== false && element) {
  //     loopEvent(evt, element.parentNode, event);
  //   }
  // }


  function innerHtml(appendTarget, ele, clear) {
    var singleTag = /\b(br|hr|input|link|img|meta|param)\b/i;

    if (singleTag.test(ele.nodeName)) {
      return;
    } //插入的是dom元素


    if (appendTarget && appendTarget.nodeType) {
      if (clear) {
        ele.innerHTML = appendTarget.outerHTML;
      } else {
        ele.appendChild(appendTarget);
      } //插入的是Dom构造器构建的元素

    } else if (appendTarget && appendTarget.constructor == Dom) {
      if (appendTarget.length) {
        var tempStr = "";

        _each(appendTarget, function (val) {
          if (clear) {
            tempStr += val.outerHTML;
          } else {
            ele.appendChild(val);
          }
        });

        if (clear) {
          ele.innerHTML = tempStr;
        }
      }
    } else {
      if (clear) {
        ele.innerHTML = appendTarget;
      } else {
        // ele.innerHTML+=tempStr;//不能清除之前的dom事件
        var vDom = document.createElement("div");
        vDom.innerHTML = appendTarget;

        _each(vDom.children, function (val) {
          ele.appendChild(clone(val));
        });

        vDom = null;
      }
    }
  } //克隆dom


  function clone(target) {
    if (target && target.nodeType) {
      return target.cloneNode();
    } else {
      return target;
    }
  } //过滤


  function _filter(orgArr, fn) {
    var arr = [];

    _each(orgArr, function (val, idx) {
      if (fn.call(val, val, idx)) {
        arr.push(this);
      }
    });

    return arr;
  } //字符串优化


  var display = "display",
      none = "none",
      unde = "undefined";

  var offsetTop = function offsetTop(elem) {
    var top = elem.offsetTop;
    var parent = elem.offsetParent;

    while (parent) {
      top += parent.offsetTop;
      parent = parent.offsetParent;
    }

    return top;
  };

  var offsetLeft = function offsetLeft(elem) {
    var left = elem.offsetLeft;
    var parent = elem.offsetParent;

    while (parent) {
      left += parent.offsetLeft;
      parent = parent.offsetParent;
    }

    return left;
  };

  var selfProp = {
    //在Ie8+支持选择器，其他浏览
    find: function find(str) {
      var self = new Dom();

      _each(this, function (val) {
        var context = val;

        var dom = _find(str, context);

        Array.prototype.push.apply(self, dom);
      });

      return self;
    },
    is: function is(selector) {
      var self = new Dom();

      _each(this, function (val) {
        if (selector == ":disabled") {
          if (getAttr(val, "disabled")) {
            Array.prototype.push.apply(self, dom);
          }
        } else if (selector == ":visible") {
          if (getCss(val, "display") != "none" && getCss(val, "visibility") != "hidden") {
            Array.prototype.push.apply(self, dom);
          }
        } else if (selector == ":hidden") {
          if (getCss(val, "display") == "none" && getCss(val, "visibility") == "hidden") {
            Array.prototype.push.apply(self, dom);
          }
        }
      });

      return self;
    },
    offset: function offset() {
      var self = this;

      if (self[0]) {
        return {
          top: offsetTop(self[0]),
          left: offsetLeft(self[0])
        };
      }
    },
    scrollTop: function scrollTop() {
      if (this[0] == window || this[0] == document || this[0] == document.body) {
        return document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
      } else {
        return this[0].scrollTop;
      }
    },
    scrollLeft: function scrollLeft() {
      if (this[0] == window || this[0] == document || this[0] == document.body) {
        return document.documentElement.scrollLeft || window.pageXOffset || document.body.scrollLeft;
      } else {
        return this[0].scrollLeft;
      }
    },
    stop: function stop() {},
    on: function on(type, delegate, fn, keep) {
      var self = this;
      type = type.split(",");
      var len = type.length; //代理

      if (typeof delegate == "function") {
        keep = fn;
        fn = delegate;
        delegate = null;
      }

      _each(this, function (val) {
        var fn1 = fn;

        if (delegate) {
          fn1 = function fn1(e) {
            var delegateNodes = _find(delegate, val);

            var delegateInfo = findDelegateDom(e.target, val, delegateNodes);

            if (delegateInfo) {
              return fn.call(delegateInfo.dom, e, delegateInfo);
            }
          };
        }

        for (var i = 0; i < len; i++) {
          var eventName = type[i].split(".")[0];
          var eventId = type[i].split(".")[1];
          val.eventMap = val.eventMap || {};
          val.eventMap[eventName] = val.eventMap[eventName] || [];

          var handlerEventFun = function handlerEventFun(e) {
            return bind(e, fn1, keep, val);
          };

          if (eventId) {
            //区分是否调用
            handlerEventFun.callId = eventId;
          }

          val.eventMap[eventName].push(handlerEventFun);

          if (delegate) {
            val[g_listner](g_type + eventName, handlerEventFun, true); //代理需要捕获
          } else {
            val[g_listner](g_type + eventName, handlerEventFun, false); //默认是需要冒泡
          }
        }
      });

      return this;
    },
    off: function off(type, delegate, fn, keep) {
      var self = this;
      type = type.split(",");
      var len = type.length; //代理

      if (typeof delegate == "function") {
        keep = fn;
        fn = delegate;
        delegate = null;
      }

      _each(this, function (val) {
        for (var i = 0; i < len; i++) {
          var eventName = type[i].split(".")[0];
          var eventId = type[i].split(".")[1];

          if (val.eventMap && val.eventMap[eventName]) {
            var refns = [];
            var saFns = [];
            val.eventMap[eventName].forEach(function (f) {
              if (eventId) {
                if (eventId == f.callId) {
                  refns.push(f);
                } else {
                  saFns.push(f);
                }
              } else {
                refns.push(f);
              }
            });
            var eventLen = refns.length;

            while (eventLen--) {
              val[g_removeListner](g_type + eventName, refns[eventLen], false);
            }

            val.eventMap[type[i]] = saFns; //清空事件
          }
        }
      });

      return this;
    },
    bind: function bind() {
      this.on.apply(this, arguments);
    },
    unbind: function unbind() {
      this.on.apply(this, arguments);
    },
    append: function append(str) {
      _each(this, function (val, i) {
        innerHtml(str, val);
      });

      return this;
    },
    appendTo: function appendTo(parent) {
      RBT.dom(parent).append(this);
      return this;
    },
    val: function val() {
      if (this.length == 0) {
        return _typeof(arguments[0]) === unde ? "" : this;
      }

      return _typeof(arguments[0]) === unde ? this[0].value : (this[0].value = arguments[0], this[0].setAttribute("value", arguments[0]), this);
    },
    prop: function prop(name, value) {
      if (arguments.length == 1) {
        if (this.length == 0) {
          return this;
        }

        return getAttr(this[0], name);
      } else {
        _each(this, function (val, i) {
          setAttr(val, name, value);
        });

        return this;
      }
    },
    html: function html(str) {
      if (arguments.length == 0) {
        if (this.length == 0) {
          return this;
        }

        return this[0].innerHTML;
      } else {
        _each(this, function (val, i) {
          innerHtml(str, val, true);
        });

        return this;
      }
    },
    //selector必须是单一的class或者是id或者是input
    parents: function parents(selector) {
      var self = RBT.dom();

      if (typeof selector !== "string") {
        return self;
      }

      var parentNodes = [];

      _each(this, function (val) {
        findParentDom(val, selector, parentNodes);
      });

      Array.prototype.push.apply(self, parentNodes);
      return self;
    },
    parent: function parent() {
      if (this.length == 0) {
        return new Dom();
      }

      return RBT.dom(this[0].parentNode);
    },
    css: function css() {
      var args = arguments;
      var len = args.length;
      var temp = [];

      if (_typeof(args[0]) === "object") {
        for (var i in args[0]) {
          _each(this, function (val) {
            setCss(val, i, args[0][i]);
          });
        }
      } else if (len === 1) {
        return getCss(this[0], args[0]);
      } else {
        _each(this, function (val) {
          setCss(val, args[0], args[1]);
        });

        return this;
      }
    },
    width: function width(_width) {
      if (this[0] == window) {
        return window.innerWidth;
      }

      if (_width) {
        return this.css("width", _width + "px");
      } else {
        if (this.css("box-sizing") == "border-box") {
          return (this.css("width") || "").toFloat();
        } else {
          return (this.css("width") || "").toFloat() - (this.css("padding-left") || "").toFloat() - (this.css("padding-right") || "").toFloat();
        }
      }
    },
    height: function height(_height) {
      if (this[0] == window) {
        return window.innerHeight;
      }

      if (_height) {
        return this.css("height", _height + "px");
      } else {
        if (this.css("box-sizing") == "border-box") {
          return (this.css("height") || "").toFloat();
        } else {
          return (this.css("height") || "").toFloat() - (this.css("padding-top") || "").toFloat() - (this.css("padding-bottom") || "").toFloat();
        }
      }
    },
    show: function (_show) {
      function show() {
        return _show.apply(this, arguments);
      }

      show.toString = function () {
        return _show.toString();
      };

      return show;
    }(function () {
      _each(this, function (val, idx) {
        if (getCss(val, display) == none) {
          setCss(val, display, show);
        }
      });

      return this;
    }),
    hide: function hide() {
      _each(this, function (val, idx) {
        if (getCss(val, display) !== none) {
          setCss(val, display, none);
        }
      });

      return this;
    },
    attr: function attr() {
      return this.prop.apply(this, arguments);
    },
    each: function each(fn) {
      _each(this, fn);

      return this;
    },
    add: function add(selector) {
      var that = this;

      _each(RBT.dom(selector), function () {
        Array.prototype.push.call(that, this);
      });

      return this;
    },
    not: function not(selector) {
      var that = this;
      var arr = [];

      _each(this, function (val, idx) {
        var selectorString = "#" + RBT.dom(val).prop("id") + "." + RBT.dom(val).prop("id").split(/\s+/).join(".");

        if (selectorString.indexOf(selector) == -1) {
          arr.push(this);
        }
      });

      var self = new Dom();
      Array.prototype.push.apply(self, arr);
      return self;
    },
    eq: function eq(idx) {
      return RBT.dom(this[idx]);
    },
    filter: function filter(fn) {
      var arr = _filter(this, fn);

      this.length = 0;
      var self = new Dom();
      Array.prototype.push.apply(self, arr);
      return self;
    },
    removeClass: function removeClass(className) {
      var args = arguments;

      _each(this, function (val, idx) {
        if (typeof className == "string") {
          var domClassName = getAttr(val, "class") || "";
          var splitClassName = className.split(/\s+/);
          var splitClassNameLen = splitClassName.length;

          while (splitClassNameLen--) {
            if (~domClassName.indexOf(splitClassName[splitClassNameLen])) {
              domClassName = domClassName.replace(splitClassName[splitClassNameLen], "");
            }
          }

          setAttr(val, "class", domClassName);
        } else if (args.length == 0) {
          setAttr(val, "class", "");
        }
      });

      return this;
    },
    remove: function remove() {
      _each(this, function () {
        this.remove();
      });
    },
    addClass: function addClass(className) {
      _each(this, function (val, idx) {
        if (typeof className == "string") {
          var domClassName = getAttr(val, "class") || "";
          var splitClassName = className.split(/\s+/);
          var splitClassNameLen = splitClassName.length;

          while (splitClassNameLen--) {
            if (domClassName.indexOf(splitClassName[splitClassNameLen]) == -1) {
              domClassName += " " + splitClassName[splitClassNameLen];
            }
          }

          setAttr(val, "class", domClassName);
        }
      });

      return this;
    },
    hasClass: function hasClass(className) {
      var val = this[0];

      if (this.length == 0) {
        return this;
      }

      if (typeof className == "string") {
        var domClassName = getAttr(val, "class") || "";
        var splitClassName = className.split(/\s+/);
        var splitClassNameLen = splitClassName.length;

        if (splitClassNameLen == 0) {
          return false;
        }

        while (splitClassNameLen--) {
          if (domClassName.indexOf(splitClassName[splitClassNameLen]) == -1) {
            return false;
          }
        }

        return true;
      } else {
        return false;
      }
    },
    toggleClass: function toggleClass(className) {
      _each(this, function (val, idx) {
        var $this = RBT.dom(val);

        if ($this.hasClass(className)) {
          $this.removeClass(className);
        } else {
          $this.addClass(className);
        }
      });

      return this;
    },
    data: function data() {
      var args = arguments;
      var ret = {};

      if (args.length == 0) {
        if (this.length) {
          this[0].selfAttributes = this[0].selfAttributes || {};

          _each(this[0].attributes, function (val, idx) {
            if (_typeof(val) == "object" && val.nodeType == 2 && val.name.indexOf("data-") == 0) {
              ret[val.name.replace("data-", "")] = val.value;
            }
          });

          _each(this[0].selfAttributes, function (val, idx) {
            if (idx.indexOf("data-") == 0) {
              ret[idx.replace("data-", "")] = val;
            }
          });
        }

        return ret;
      } else if (args.length == 1) {
        if (this.length) {
          this[0].selfAttributes = this[0].selfAttributes || {};
          var dataValue = this[0].attributes["data-" + args[0]];
          var dataValue2 = this[0].selfAttributes["data-" + args[0]];

          if (_typeof(dataValue) == "object" && dataValue.nodeType == 2) {
            return dataValue.value;
          } else if (typeof dataValue != "undefined") {
            return dataValue;
          } else {
            return dataValue2;
          }
        }
      } else {
        _each(this, function (val, idx) {
          var dataName = args[0];

          if (dataName) {
            var dataValue = args[1];

            if (_typeof(dataValue) == "object" || typeof dataValue == "function") {
              val.selfAttributes = val.selfAttributes || {};
              val.selfAttributes["data-" + dataName] = dataValue;
            } else {
              setAttr(val, "data-" + dataName, dataValue);
            }
          }
        });
      }

      return this;
    },
    trigger: function trigger(eventName) {
      if (eventName == "blur") {
        document.body.focus();
        return this;
      }

      _each(this, function (val, idx) {
        fireEvent(val, eventName);
      });

      return this;
    }
  }; //翻转

  RBT.dom.each = function (arr, fn) {
    _each(arr, function (val, idx) {
      fn.call(val, idx, val);
    });
  };

  RBT.dom.extend = extend;

  RBT.dom.type = function (tar) {
    if (_typeof(tar) == "object") {
      if (tar == null) {
        return "null";
      } else if (tar.length != null) {
        return "array";
      } else {
        return "object";
      }
    }

    return _typeof(tar);
  };

  RBT.dom.trim = function (val) {
    if (val) {
      return val.toString().replace(/^\s+|\s+$/, "");
    }

    return "";
  };

  RBT.dom.isEmptyObject = function (obj) {
    var name;

    for (name in obj) {
      return false;
    }

    return true;
  }; // RBT.dom.cookie =RBT.cookie;
  // RBT.dom.ajax =RBT.ajax;
  // RBT.dom.floatHeight =RBT.floatHeight;


  _each(["submit", "keyup", "mousedown", "mouseleave", "click", "change", "mousemove", "mouseup", "mouseenter", "scroll", "resize", "blur", "focus"], function (val, idx) {
    selfProp[val] = function (fn) {
      if (fn) {
        this.on(val, fn);
      } else {
        this.trigger(val);
      }

      return this;
    };
  }); //扩展实例


  RBT.dom.fn = Dom.prototype;

  for (var prop in selfProp) {
    RBT.dom.fn[prop] = selfProp[prop];
  }
})();

;
/*
	AUTHOR : robert
	GLOBAL : 全局模块 RBT 对外接口 dom
	RETURN : RBT.dom的实例
	DEPENDENCE : RBT.each，RBT.extend
*/

;

(function () {
  window.RBT = window.RBT || {};
  var accept = {
    "*": "*/*",
    html: "text/html",
    json: "application/json, text/javascript",
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
    text: "text/plain",
    xml: "application/xml, text/xml"
  };
  var contentType = "application/x-www-form-urlencoded; charset=UTF-8";

  RBT.ajax = function (opts) {
    var xhr = new XMLHttpRequest();

    if (opts.returnType) {
      opts.async = true;
    }

    if (opts.async !== false) {
      opts.async = true;
    }

    var type = opts.type && opts.type.toUpperCase() || "GET";
    var data = opts.data;

    if (_typeof(opts.data) == "object") {
      data = RBT.url().parse(data);
    }

    if (type == "GET") {
      var newUrl = RBT.url(opts.url).appendParams(data);
      xhr.open(type, newUrl.url, opts.async);
    } else {
      xhr.open(type, opts.url, opts.async);
    }

    if (opts.returnType) {
      xhr.responseType = opts.returnType;
    }

    if (!opts.crossDomain) {
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    }

    if (opts.headers) {
      for (var headerKey in opts.headers) {
        xhr.setRequestHeader(headerKey, opts.headers[headerKey]);
      }
    }

    xhr.onload = function (ret) {
      if (this.status == "200") {
        if (opts.dataType == "json") {
          try {
            typeof opts.success == "function" && opts.success(JSON.parse(xhr.response));
          } catch (e) {
            console.error(e);
            typeof opts.error == "function" && opts.error(this.status, xhr, e);
          }
        } else {
          typeof opts.success == "function" && opts.success(xhr.response);
        }
      } else {
        typeof opts.error == "function" && opts.error(this.status, xhr);
      }

      typeof opts.complete == "function" && opts.complete(xhr);
      xhr = null;
      opts = null;
    };

    xhr.onerror = function () {
      typeof opts.error == "function" && opts.error(this.status, xhr);
    };

    xhr.setRequestHeader('Content-Type', contentType);

    if (opts.dataType && accept[opts.dataType]) {
      xhr.setRequestHeader('Accept', accept[opts.dataType]);
    } else {
      xhr.setRequestHeader('Accept', '*/*');
    }

    if (data && type == "POST") {
      xhr.send(data);
    } else {
      xhr.send();
    }
  };
})();

;
;

(function ($) {
  window.RBT = window.RBT || {};
  var resizeTimer;
  RBT.resizeStack = [];
  $(window).off("resize.chat").on("resize.chat", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      for (var i = 0; i < RBT.resizeStack.length; i++) {
        RBT.resizeStack[i].fn.apply(RBT.resizeStack[i].context, RBT.resizeStack[i].params);
      }
    }, 200);
  });
  $(function () {});
})(RBT.dom);

;

try {
  window.RBT = window.RBT || {};
  /*
  ** rbt 封装cookie
  */

  RBT.cookie = function (name, value, opts) {
    if (arguments.length == 0) {
      return document.cookie;
    } else if (arguments.length == 1) {
      return fn.getItem(name);
    } else if (arguments.length >= 2) {
      fn.setItem(name, value);
    }
  };

  var fn = {
    getItem: function getItem(sKey) {
      if (!sKey || !this.hasOwnProperty(sKey)) {
        return null;
      }

      return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    },
    key: function key(nKeyId) {
      return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
    },
    setItem: function setItem(sKey, sValue) {
      if (!sKey) {
        return;
      } //必须设置为过期时间，不然就删不掉


      document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
      this.length = document.cookie.match(/\=/g).length;
    },
    length: 0,
    removeItem: function removeItem(sKey) {
      if (!sKey || !this.hasOwnProperty(sKey)) {
        return;
      }

      document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      this.length--;
    },
    hasOwnProperty: function hasOwnProperty(sKey) {
      return new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(document.cookie);
    }
  };
  RBT.cookie.prototype = fn
  /*
  ** localStorage window.parent cookie 整合为离线存储
  */
  ;

  (function () {
    var localStorage = window.localStorage,
        isWriteLocalStorage = false,
        isWriteCookie = false;

    function checkWrite(obj) {
      var isWrite = false;

      try {
        if (_typeof(obj) === "object") {
          obj.removeItem("local_test_temp");
          obj.setItem("local_test_temp", true);
          isWrite = obj.getItem("local_test_temp");

          if (isWrite) {
            obj.removeItem("local_test_temp");
          }
        }
      } catch (e) {
        ; //no alert
      }

      return isWrite;
    }

    isWriteLocalStorage = checkWrite(localStorage);
    isWriteCookie = checkWrite(RBT.cookie); //ios7   ie8以下兼容

    if (!isWriteLocalStorage) {
      if (isWriteCookie) {
        RBT.localStorage = RBT.cookie;
      } else {
        if (!RBT.localStorage) {
          RBT.localStorage = {
            getItem: function getItem(sKey) {
              if (!sKey || !this.hasOwnProperty(sKey)) {
                return null;
              }

              return this[sKey];
            },
            setItem: function setItem(sKey, sValue) {
              if (!sKey) {
                return;
              }

              window.parent.RBT = window.parent.RBT || {};
              window.parent.RBT.localStorage[sKey] = sValue;
              this[sKey] = sValue;
            }
          };
        }
      }
      /*chrome 不支持本地cookie*/

    } else {
      RBT.localStorage = localStorage;
    }
  })();
} catch (e) {
  alert("RBT.localStorage.js:" + e);
}

;
;

(function () {
  window.RBT = window.RBT || {};

  function URI(uri) {
    if (uri) {
      this.url = uri.replace(/\s+/g, "").replace(/"|'/g, "").replace(/\/$/g, "").replace(/\\/g, "/").replace(/\/+/g, "/").replace(/(^http:|^https:)/g, function (m, m1) {
        return m1 + "/";
      });
    } else {
      this.url = "";
    }
  } //[key]:value


  function getKey(key, value, link) {
    var ret = [];

    if (_typeof(value) == "object") {
      for (var subkey in value) {
        if (key) {
          ret = ret.concat(getKey(key + "[" + subkey + "]", value[subkey], link));
        } else {
          ret = ret.concat(getKey(subkey, value[subkey], link));
        }
      }

      if (ret.length == 0) {//{b:[],c:{b:{}}}不需要解析，如需要请在这里添加
      }

      return ret;
    } else {
      return [key + link + encodeURIComponent(value)];
    }
  } //a[b][c]:1 表示a:{b:{c:1}}
  //a[]:1,a[]:2表示a:[1,2]


  URI.prototype.parse = function (obj, sp, link) {
    sp = sp || "&";
    link = link || "=";
    var retStrArr = [];

    if (Object.prototype.toString.call(obj) == "[object Object]") {
      retStrArr = getKey("", obj, link);
    } else {
      throw Error("params error:params must object!");
    }

    return retStrArr.join(sp);
  }; //添加url参数


  URI.prototype.appendParams = function (data) {
    if (_typeof(data) == "object") {
      data = this.parse(data);
    }

    var hash = this.url.split("#");
    var search = hash[0].split("?");
    this.url = search[0] + (search[1] ? "?" + search[1] + (data && "&" + data || "") : data && "?" + data || "") + (hash[1] && "#" + hash[1] || "");
    return this;
  };

  RBT.url = function (uri) {
    return new URI(uri);
  };
})();

;
/**
* 模板解析器,不能跟服务同样的规则
*[[variable]] [[#each array]] [[$index]] [[$length]] [[$value]] ... [[#endEach]] [[#if]] ... [[#elseIf]] ... [[#endIf]]

*/

RBT.parseTeample = function (templStr, json) {
  templStr = templStr.seam() //each
  .replace(/\[\[#each\s+([^\]]+)\s*\]\]/g, function (m, m1) {
    return "\"+(function(){try{var $length =" + m1 + "&&" + m1 + ".length; var t=\"\";RBT.each(" + m1 + "&&" + m1 + ",function($value,$index){ \n t+= \"";
  }).replace(/\[\[#endEach\s*\]\]/g, "\"});return t;}catch(e){console.warn(e&&e.stack)}}()) +\"") //ifelse
  .replace(/\[\[#if\s+([^\]]+)\s*\]\]/g, function (m, m1) {
    return "\"; try{if(" + m1.replace(/\\/g, "") + "){ t+=\"";
  }).replace(/\[\[#elseIf\s+([^\]]+)\s*\]\]/gi, function (m, m1) {
    return "\"; }else if(" + m1.replace(/\\/g, "") + "){ t+=\"";
  }).replace(/\[\[#else\s*\]\]/g, function (m, m1) {
    return "\";}else{ t+=\"";
  }).replace(/\[\[#endIf\s*\]\]/gi, function (m, m1) {
    return "\"}}catch(e){console.warn(e&&e.stack)} t+=\"";
  }) //表达式/变量
  .replace(/\[\[\s*([^\]]+)\s*\]\]/g, function (m, m1) {
    return "\"+" + m1.replace(/\\/g, "") + "+\"";
  });

  try {
    var result = "with(obj){var t =\"" + templStr.replace(/\+$/, "") + "\"} return t;";
    var fn = new Function("obj", result);
  } catch (e) {
    return result;
  }

  return fn(json);
};

;

(function ($, parseTeample) {
  var templateHtml = "<dl class='down-menu-wrap' style='width:[[obj.width]]px;left:[[obj.left]]px'></dl>";
  var templateData = "[[#each obj]]<dd class=' matched'><a data-href='[[$value.href]]' class='[[$value.className]]' [[($value.attrs?$value.attrs:'')]]>[[$value.value]]</a> <i class='fa-close'></i></dd>[[#endEach]]";

  $.fn.downMenu = function () {
    var that = this;
    this.each(function () {
      var $this = $(this);
      var $parent = $this.parent();

      if ($this.data("init-downmenu")) {
        return;
      }

      $this.data("init-downmenu", true);
      $parent.append(parseTeample(templateHtml, {
        left: $this.offset().left - $parent.offset().left,
        width: $this.width()
      }));
      var $menu = $parent.find(".down-menu-wrap");

      if (!$parent.hasClass("relative")) {
        $parent.addClass("relative");
      }

      var timer;
      $this.on("focus", function () {
        console.log("focus");
        clearTimeout(timer);
        $menu.addClass("active");
      });
      $this.on("blur", function () {
        console.log("blur");
        clearTimeout(timer);
        timer = setTimeout(function () {
          $menu.removeClass("active");
        }, 200);
      });
      var inputTimer;
      $this.on("keyup", function () {
        clearTimeout(inputTimer);
        inputTimer = setTimeout(function () {
          var val = $this.val().trim();

          if (val) {
            $menu.find("dd").each(function () {
              var htmlVal = $(this).find("a").html().trim();

              if (new RegExp(val.toReg()).test(htmlVal)) {
                $(this).addClass("matched");
              } else {
                $(this).removeClass("matched");
              }
            });
          } else {
            $menu.find("dd").addClass("matched");
          }
        }, 200);
      });
      $menu.on("click", ">dd", function () {
        clearTimeout(timer);
        var $dd = $(this);
        $menu.removeClass("active");
        $this.val($dd.find("a").html().trim()).trigger("change").trigger("blur");
        $("body").focus();
      });
    });
    return {
      add: function add(data) {
        var newObj = [];

        if (data && _typeof(data) == "object") {
          $.each(data, function (idx, val) {
            if (_typeof(val) == "object" && val.value) {
              newObj.push(val);
            } else {
              newObj.push({
                value: idx,
                href: val,
                className: "downmenu-item"
              });
            }
          });
        }

        that.each(function () {
          var $parent = $(this).parent();
          var $menu = $parent.find(".down-menu-wrap");
          $menu.html(parseTeample(templateData, newObj));
        });
        return this;
      }
    };
  };
})(window.RBT.dom, RBT.parseTeample);

;
;

(function ($, resizeStack) {
  window.RBT = window.RBT || {}; //设置等高，必须是开始在同一水平线上

  function setHeight($item, start, end, height, level) {
    for (var i = start; i < end; i++) {
      $item.eq(i).addClass("height-row-" + level).height(height);
    }
  }

  function floatHeight(obj, item) {
    $(obj).each(function () {
      var $that = $(this);
      var $item = $that.find(item);

      if ($item.length < 2) {
        return;
      }

      var level = 0; //层数

      var start = 0;
      var perOffsetTop = $item.offset().top;
      var maxHeight = 0;
      $item.each(function (val, idx) {
        var $this = $(this).css("height", null);
        var top = $this.offset().top;

        if (top != perOffsetTop) {
          setHeight($item, start, idx, maxHeight, level);
          level++;
          start = idx;
          maxHeight = $this.height();
        } else {
          maxHeight = Math.max(maxHeight, $this.height());
        }
      });

      if (start != $item.length - 1) {
        setHeight($item, start, $item.length, maxHeight, level);
      }
    });
  } //依赖dom.js prototype.js


  RBT.floatHeight = function (obj, item) {
    floatHeight(obj, item);
    resizeStack.push({
      fn: floatHeight,
      context: null,
      params: [obj, item]
    });
  };
})(RBT.dom, RBT.resizeStack);

;
;

(function ($, undefined) {
  window.console = window.console || {
    error: function error() {}
  };
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
  }

  ;
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

    return newArr.join(",");
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
    email: {
      check: function check(value) {
        var value = $.trim(value);
        var invalidLetter;

        if (value.length > 254) {
          return "length-error";
        } else if (value.indexOf("@") == -1) {
          return "at-error";
        } else if (!/^(\w|[!#$%&’*+-/=?^`{}|~.])+@[^@]*$/.test(value)) {
          invalidLetter = value.replace(/@[^@]+$/, "").replace(/\w|[!#$%&’*+-/=?^`{}|~.]/g, "");
          return ["account-letter-forbidden", unique(invalidLetter)];
        } else if (/[.]{2}/.test(value)) {
          return "double-dot-error";
        } else if (!/^.{1,63}@[^@]*$/.test(value)) {
          return "account-length-error";
        } else if (!(/(^[^.].*@[^@]*$)/.test(value) && /^.*[^.]@[^@]*$/.test(value))) {
          return "prevDot-error";
        } else if (!/^[^@]+@([0-9]|[A-Z]|[a-z]|[\-.])+$/.test(value)) {
          invalidLetter = value.replace(/^[^@]+@/, "").replace(/[A-Za-z0–9\-.]/g, "");
          return ["nextLetter-forbidden", unique(invalidLetter)];
        } else if (!(/^[^@]+@[^-].*$/.test(value) && /^[^@]+@.*[^-]$/.test(value))) {
          return "nextLine-error";
        } else if (!/^[^@]+@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
          return "domain-error";
        }

        return false;
      }
    },
    required: {
      check: function check(value) {
        return $.trim(value) == '';
      }
    },
    mobile: {
      check: function check(value) {
        return !/^\d{5,}$/.test($.trim(value));
      }
    },
    phone: {
      check: function check(value) {
        value = $.trim(value).replace(/\s+/g, "");
        var innercheck = !/^\d{1,}[0-9-]{3,}$/.test(value);
        var outercheck = !/^\+\d{1,}[0-9-]{3,}$/.test(value);
        return innercheck && outercheck;
      }
    },
    letter: {
      check: function check(value) {
        value = $.trim(value);
        return !(getByteLen(value) == value.length);
      }
    },
    chinese: {
      check: function check(value) {
        return !/^[\u4e00-\u9fff]+$/.test($.trim(value));
      }
    },
    date: {
      check: function check(value) {
        return /Invalid|NaN/.test(new Date($.trim(value)).toString());
      }
    },
    //请输入有效身份证
    idcard: {
      check: function check(value) {
        return !(/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/.test(value) || /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/.test(value));
      }
    },
    maxvalue: {
      check: function check(value, $obj) {
        //传递了比较值
        var value2 = $obj.data("maxvalue");

        if (value2) {
          this.value = parseNum(value2);
        }

        value = parseNum(value);
        return !(value <= this.value);
      }
    },
    minvalue: {
      check: function check(value, $obj) {
        //传递了比较值
        var value2 = $obj.data("minvalue");

        if (value2) {
          this.value = parseNum(value2);
        }

        value = parseNum(value);
        return !(value >= this.value);
      }
    },
    multiple: {
      check: function check(value, $obj) {
        //传递了比较值
        var value2 = $obj.data("multiple");

        if (value2) {
          this.value = parseNum(value2);
        }

        value = parseNum(value);
        return value % this.value;
      }
    },
    bigger: {
      check: function check(value, $obj) {
        //传递了比较值
        var $bigger = $($obj.data("bigger"));
        var value2 = $bigger.val(); //比较的值必须有输入

        if (typeof value2 == "undefined" || value2 == "") {
          return;
        }

        if (value2) {
          this.value = parseFloat(value2, 10);
        }

        value = parseFloat(value, 10);
        return !(value < this.value);
      }
    },
    matchoption: {
      check: function check(value, $obj) {
        var isTextValue = $obj.parents(".J-select").find(".J-select-text").val();
        var isValue = $obj.parents(".J-select").find(".J-select-value").val();
        return isTextValue && (isValue == null || isValue == "");
      }
    },
    smaller: {
      check: function check(value, $obj) {
        //传递了比较
        var $bigger = $($obj.data("smaller"));
        var value2 = $bigger.val(); //比较的值必须有输入

        if (typeof value2 == "undefined" || value2 == "") {
          return;
        }

        if (value2) {
          this.value = parseFloat(value2, 10);
        }

        value = parseFloat(value, 10);
        return !(value > this.value);
      }
    },
    maxlength: {
      check: function check(value, $obj) {
        return !(value.length <= parseNum($obj.data("maxlength")));
      }
    },
    minlength: {
      check: function check(value, $obj) {
        return !(value.length >= parseNum($obj.data("minlength")));
      }
    },
    pswagain: {
      check: function check(value, $obj) {
        //传递了比较值pswAgain传递是一个jquery选择器字符
        var sel = $obj.data("pswagain");
        var value2 = $(sel).val();
        return !($.trim(value) == $.trim(value2));
      }
    },
    password: {
      check: function check(value, $obj) {
        if (/^\d+$/.test(value.trim())) {
          return true;
        } else if (!/\d/.test(value.trim())) {
          return true;
        } else {
          return false;
        }
      }
    }
  };
  /**
   *
   * 跟据校验规则校验单条数据
   * */

  function checkBothRule(checkBothType, $target, value, from) {
    var errorCode;
    var errorMsg;
    var errorParams;
    var checkTypeName;
    var orCheck = checkBothType.length > 1 ? true : false;

    for (var j = 0; j < checkBothType.length; j++) {
      checkTypeName = checkBothType[j]; //如果checktype没有或者checktype函数没有就跳出循环继续

      if (!validRules[checkTypeName] || !validRules[checkTypeName].check) {
        continue;
      } //在submit的时候提交


      if (from == "blur" && value == "" && !$target.parents("form").data("blur-check-empty")) {
        continue;
      } //将对象和值传递过去 true表示错误


      errorCode = validRules[checkTypeName].check(value, $target);
      errorMsg = "";

      if (errorCode) {
        checkTypeName = checkTypeName.toLowerCase();
        errorMsg = $target.data(checkTypeName + "-msg") || $target.data(checkTypeName + "-default-msg"); //校验带参数

        if (_typeof(errorCode) == "object") {
          errorParams = errorCode.slice(1);
          errorCode = errorCode[0].toLowerCase();
          errorMsg = tpl.apply($target.data(checkTypeName + "-" + errorCode + "-msg"), errorParams);
        } else if (typeof errorCode == "string") {
          errorCode = errorCode.toLowerCase();
          errorMsg = $target.data(checkTypeName + "-" + errorCode + "-msg");
        } //校验成功之后的函数,“或”规则只要成功就跳出

      } else if (orCheck) {
        errorMsg = "";
        errorCode = "";
        checkTypeName = "";
        break;
      }
    }

    return {
      code: errorCode,
      msg: errorMsg,
      checkType: checkTypeName
    };
  }
  /**
   *
   * 跟据校验规则校验单条数据
   * */


  function checkByRule($subFrom, $target, error, success, from) {
    var value, name;

    if ($target.data("check-is-html")) {
      value = $.trim($target.html().replace(/\n|\t/g, ""));
    } else if ($target.length && $target.attr("type") == "checkbox") {
      name = $target.attr("name");
      value = $subFrom.find("input[name='" + name + "']:checked").length ? "1" : "";
    } else if ($target.length && $target.attr("type") == "radio") {
      name = $target.attr("name");
      value = $subFrom.find("input[name='" + name + "']:checked").length ? "1" : "";
    } else {
      value = $.trim($target.val());
    }

    var checkTypes = $target.attr("check-type");
    var checkBothType; //共同校验分隔符'空格' '，' '&&'

    checkTypes = checkTypes && checkTypes.split(/\s+|,|&&/) || [];

    for (var i = 0; i < checkTypes.length; i++) {
      //"或"规则的检测项
      checkBothType = checkTypes[i].split("|"); //校验"或"规则

      var checkStatus = checkBothRule(checkBothType, $target, value, from); //当前校验有错误

      if (checkStatus.code) {
        if ($.type(error) == "function") {
          error($target, checkStatus.code, checkStatus.msg, checkStatus.checkType);
        }

        return false;
      }
    } //end for i
    //全部成功之后单个校验完成


    if ($.type(success) == "function") {
      if (from == "blur" && value == "" && !$target.parents("form").data("blur-check-empty")) {//空字符且为blur事件
      } else {
        success($target);
      }
    } //全部类型都校验成功之后返回true


    return true;
  }
  /**校验执行函数
   * opts = setRule 外部使用用于扩展校验方法
   * opts = setBlur 内部使用用于绑定blur校验
   * */


  function checkForm($subFrom, opts, success, successList, error, obj) {
    var $subFormInput; //刷选出校验的数据

    if (opts == "setBlur") {
      $subFormInput = $subFrom.find("input").add($subFrom.find("textarea")).add($subFrom.find("select")).add($subFrom.find(".needCheck"));
    } else {
      $subFormInput = $subFrom.find("input").add($subFrom.find("textarea")).add($subFrom.find("select")).add($subFrom.find(".needCheck")).not(".noCheck").not(":disabled");
    }

    var retVal = true;
    $subFormInput.each(function () {
      var $this = $(this); //如果没有设置checktype就返回

      if (!$this.attr("check-type")) {
        return;
      } //如果设置focus,blur为true 函数为设定绑定focus,blur事件,


      if (opts == "setBlur") {
        if (!$this.data("blur")) {
          //不重复绑定
          $this.data("blur", false);
          $this.bind("blur", function () {
            //用于动态取消校验
            if ($this.hasClass("noCheck") || $this.is(":disabled")) {
              return;
            } //这里的校验不会传递successList


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
          $this.bind("focus", function () {
            if (typeof obj.focusCallback == "function") {
              obj.focusCallback($this);
            }
          });
        }

        return;
      } //跟据校验规则校验单条数据


      var retItemVal = checkByRule($subFrom, $this, error, successList); //只要发生错误就会一直保持错误值

      if (retVal) {
        retVal = retItemVal;
      } //当发生错误时，且one-error-throw=true。执行一条错误校验。并且之后表单停止校验直接返回


      if ($subFrom.data("one-error-throw") && retVal == false) {
        return false;
      }
    }); //end each
    //不进行校验

    if (opts == "setBlur") {
      return;
    } //如果全部通过


    if ($.type(success) == "function" && retVal) {
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
      error = alert;
    } //提供选择器缓存和不缓存


    var $subFrom;

    if ($.type(selector) == "string") {
      $subFrom = $(selector);
    } else {
      $subFrom = selector;
    } //失去焦点就校验对象


    checkForm($subFrom, "setBlur", success, successList, error, obj); //验证执行函数 //工厂模式

    return function (opts) {
      //设置校验参数
      if (opts == "getRule") {
        return validRules;
      }

      return checkForm($subFrom, opts, success, successList, error);
    };
  } //end valiForm2

  /**
   * 提交按钮全部填充完才显示提交状态
   * */


  function initDisableBtn($form) {
    var $input = $form.find("input");
    var $select = $form.find("select");
    var $textarea = $form.find("textarea");
    var $check = $input.add($select).add($textarea).not(".noCheck").not(":disabled").filter(function () {
      var checkType = $(this).attr("check-type");

      if (checkType || checkType && checkType.indexOf("required") == -1) {
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
      $needCheck.each(function () {
        if (!$(this).val() && $(this).val() !== 0) {
          ret = false;
          return false;
        }

        if ($(this).attr("type") == "radio" || $(this).attr("type") == "checkbox") {
          var name = $(this).attr("name");
          var checkVal = $("input[name='" + name + "']:checked").val();

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
    } //输入之后变亮


    $form.off("keyup.checkBtn", "input,textarea").on("keyup.checkBtn", "input,textarea", function () {
      checkBtn();
    });
    $form.off("change.checkBtn", "select,input,textarea").on("change.checkBtn", "select,input,textarea", function () {
      checkBtn(); //特殊处理

      if ($(this).attr("type") == "radio") {
        $(this).parents(".J-validItem").removeClass("validError");
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
      success: function success() {
        if (typeof opts.success == "function" && opts.success($currentSubBtn, $form) === false) {
          return;
        }

        $form.removeClass("validing");
      },
      successList: function successList($target) {
        if (typeof opts.successList == "function" && opts.successList($target, $form) === false) {
          return;
        }

        $target.parents(".J-validItem").removeClass("validError").addClass("validSuccess");
      },
      blurCallback: function blurCallback($target, success) {
        if (typeof opts.blur == "function" && opts.blur($target, $form) === false) {
          return false;
        } else if (typeof success == "function") {
          //如果没有ajax校验就成功了
          if (!$target.data("ajax-check")) {
            success($target);
          }
        }
      },
      focusCallback: function focusCallback($target) {
        if (typeof opts.focus == "function" && opts.focus($target, $form) === false) {
          return;
        }

        $target.parents(".J-validItem").removeClass("validError").removeClass("validSuccess");
      },
      error: function error($target, code, msg, type) {
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
    }; //解决多个提交按钮的不同校验

    var $currentSubBtn;
    $form.off("click", ".J-submitBtn").on("click", ".J-submitBtn", function () {
      //提交按钮在提交之后如果表正在校验就停止校验，没有变亮按钮也是不能校验的
      if ($form.hasClass("validing") || $(this).hasClass("disabled")) {
        return false;
      }

      $currentSubBtn = $(this);
      $form.submit();
    }); // 提交按钮全部填充完才显示提交状态指定J-submitFocus

    initDisableBtn($form); //对于提交按钮要求指定focus

    $("body").off("keyup.submit").on("keyup.submit", function (e) {
      //enter
      if (e.keyCode * 1 == 13 && !$(e.target).hasClass("J-select") && !$(e.target).parents(".J-select").length && e.target.nodeName != "TEXTAREA") {
        $(this).find(".J-submitBtn.J-submitEnter").trigger("click");
        e.stopPropagation();
        e.preventDefault();
      }
    });
    var validForm = valiForm($.extend({}, opts, validOpts)); //提交

    $form.off("submit").on("submit", function () {
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
    }); //外部引用校验函数

    $form.data("valid-form", validForm);
  }

  $.fn.validForm = function (opts) {
    return this.each(function () {
      valiFormMiddle($(this), opts);
    });
  };

  function layzeSetVisible($this) {
    var selectHeight = $this.height();
    var selectOffsetTop = $this.offset().top;
    var optionsMaxHeight = parseNum($this.find(".J-select-option").css("max-height"));
    var optionsMinHeight = parseNum($this.find(".J-select-option").css("min-height"));
    var optionsContentHeight = parseNum($this.find(".J-select-option").height());
    var optionsHeight = 0;
    $this.find(".J-select-option").children().each(function () {
      optionsHeight += $(this).height();
    });
    optionsHeight = Math.min(optionsHeight, optionsMaxHeight);
    optionsHeight = Math.max(optionsHeight, optionsMinHeight);
    optionsHeight = Math.max(optionsHeight, optionsContentHeight);
    var wheight = $(window).height();
    var scrollTop = $(window).scrollTop();

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
    var isAndroid = userAge.match(/android-?\s*(\d+\D\d+(\D\d+)?)/i) || userAge.match(/Linux\s(armv7l)/i);
    var SymbianOS = /SymbianOS/i.test(userAge);
    var IEMobile = userAge.match(/IEMobile\s*(\d+(\D\d+)?(\D\d+)?)/i);
    var isMobile = /Mobile/i.test(userAge);
    var BlackBerry = userAge.match(/BlackBerry\s(\d+(\D\d+)?)/i) || userAge.match(/BB10;/i);
    var isUc = userAge.match(/UCWEB\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i) || /\bUC\b/.test(userAge);
    var hpwOS = userAge.match(/hpwOS\s*\/\s*(\d+\D\d+(\D\d+)?)/);
    var BrowserNG = userAge.match(/BrowserNG\s*\/\s*(\d+\D\d+(\D\d+)?)/);
    var chromeMobile = userAge.match(/CrMo\s*\/\s*(\d+\D\d+(\D\d+)?)/i) || userAge.match(/CriOS\s*\/\s*(\d+\D\d+(\D\d+)?)/i) || userAge.match(/CrOS\si686\s*(\d+\D\d+(\D\d+)?)/i);
    var OperaMini = userAge.match(/Opera\sMini\s*\/?\s*(\d+(\D\d+)?(\D\d+)?)/i);
    var SAMSUNG = userAge.match(/SAMSUNG/);

    if (isIphone || isIpad || isIpod || isAndroid || isMobile || SymbianOS || BlackBerry || IEMobile || isUc || hpwOS || BrowserNG || chromeMobile || OperaMini || SAMSUNG) {
      return true;
    }
  }

  var browserMobile = isMobile(window.navigator.userAgent);
  $("body").off("initselect").on("initselect", function () {
    initSelect();
  });
  /**
   * 下拉菜单
   * */

  function initSelect() {
    $("form,.J-selectParent").each(function () {
      if ($(this).data("initselect")) {
        return;
      }

      $(this).data("initselect", true);
      $(this).off("touchstart mouseup", ".J-select").on("touchstart mouseup", ".J-select", function (e) {
        var $this = $(this);

        if (e.type != "touchstart" && browserMobile) {
          return;
        } else if (e.type != "mouseup" && !browserMobile) {
          return;
        }

        if ($(this).hasClass("J-mobile-select") && browserMobile) {
          return;
        } //移动端需要点击滑动


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
          $this.removeClass("current").trigger("selecthide");
        } else {
          //避免和active同时存在
          // if ($this.hasClass("J-option-multi")&& $this.find(".option-group.active").length!=0) {
          //   $this.find(".option-group").removeClass("showActive")
          // }
          $this.addClass("current");
        }

        if ($this.hasClass("J-vertical-visible")) {
          layzeSetVisible($this);
        } //选中

      }).off("click", ".J-select-option .option").on("click", ".J-select-option .option", function (e) {
        if ($(this).parents(".J-select").hasClass("J-mobile-select") && browserMobile) {
          return;
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
        var selectData; //多选获取值

        function getMutilOptionData($select) {
          var names = [];
          var values = [];
          var allSelect = true;
          $select.find(".option input").each(function () {
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
          return {
            names: names,
            values: values,
            allSelect: allSelect
          };
        } //处理多选checkbox


        function handlerMutilCheckbox() {
          var $curInput = $option.find("input");

          if ($curInput.prop("checked")) {
            $curInput.prop("checked", false);
          } else {
            $curInput.prop("checked", true);
          } //全选


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
            var selectData = getMutilOptionData($select); //已经全部选中需要把all-option的input的点亮

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

          $allOptions.removeClass("active");
          $select.find("input:checked").each(function () {
            $(this).parents(".option").addClass("active");
          });
        } //处理elive 日期checkbox


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
          titleName = titleName && titleName.toString().replace(/^\s+|\s+$/, ""); //全选

          if ($curInput.hasClass("J-select-all-ipt")) {
            if ($curInput.prop("checked")) {
              $parent.find("input").prop("checked", true);
              var selectData = getMutilOptionData($parent); //需要提前设置selectParentValue，外部统一监听select-value

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
            var selectData = getMutilOptionData($parent); //已经全部选中需要把all-option的input的点亮

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
            $select.find(".option-group").eq($parent.index()).addClass("active");
          }

          $allOptions.removeClass("active");
          $parent.find("input:checked").each(function () {
            $(this).parents(".option").addClass("active");
          });
        } //树形结构


        function getTreeOptionData($select, oldData) {
          oldData = oldData || {
            names: [],
            values: [],
            allSelect: true
          };
          $select.find(">.J-select-option>.option>.minicheckbox-wrap input").each(function () {
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
        } //树形checkbox


        function hanlderTreeCheckBox() {
          $curInput = $option.find(">.minicheckbox-wrap>input");

          if ($curInput.length && !($(e.target).hasClass("J-select-expention") || $(e.target).parents().hasClass("J-select-expention"))) {
            var $allInput = $option.find("input");

            if ($curInput.prop("checked")) {
              //子类全部设置false
              $allInput.prop("checked", false).change(); //父类全部设置false

              $curInput.parents(".option").each(function () {
                $(this).find(">.minicheckbox-wrap>input").prop("checked", false).change();
                ;
              });
            } else {
              //子类全部设置true
              $allInput.prop("checked", true).change(); //父类需要检测是否全选

              $curInput.parents(".option").each(function () {
                var isAllTrue = true;
                $(this).find(".J-select-option input").each(function () {
                  if (!$(this).prop("checked")) {
                    isAllTrue = false;
                    return false;
                  }
                });

                if (isAllTrue) {
                  $(this).find(">.minicheckbox-wrap>input").prop("checked", true).change();
                }
              });
            }

            var selectData = getTreeOptionData($select);
            $allOptions.removeClass("active");
            $select.find("input:checked").each(function () {
              $(this).parents(".option").addClass("active");
            });
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
        } //树形+多选checkbox


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
            $left = $curInput.parents(".option-group");
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
            $right.find("input").each(function () {
              if (!$(this).prop("checked")) {
                selectAll = false;
                return false;
              }
            });
            $left.find("input").prop("checked", selectAll);
          }

          var selectData = {
            names: [],
            values: []
          }; //处理active 和获取值

          $select.find(".option-group").each(function () {
            var $leftItem = $(this);
            var matchIndex = $leftItem.index();
            var $rightItem = $select.find(".option-group-item").eq(matchIndex);

            if ($leftItem.find("input").prop("checked")) {
              //全选
              $leftItem.find(".option").addClass("active");
              $rightItem.find(".option").addClass("active");
              $leftItem.addClass("active");
              var titleName = $leftItem.find(".option").data("name");
              var titlevalue = $leftItem.find(".option").data("value");
              titleName = titleName && titleName.toString().replace(/^\s+|\s+$/, "");
              selectData.names.push(titleName);
              selectData.values.push(titlevalue);
            } else {
              $leftItem.find(".option").removeClass("active");
              $leftItem.removeClass("active");
              $rightItem.find("input").each(function () {
                var $op = $(this).parent().parent(); //必须是两层结构

                if ($(this).prop("checked")) {
                  $leftItem.find(".option").addClass("active");
                  $leftItem.addClass("active"); //有值

                  selectData.names.push($op.data("name"));
                  selectData.values.push($op.data("value"));
                  $op.addClass("active");
                } else {
                  $op.removeClass("active");
                }
              });
            }
          });
          $selectText.val(selectData.names.join(",")).change();
          $selectValue.val(selectData.values.join(",")).change();
        } //默认


        function handlerNormal() {
          if ($select.data("cancel-self") && $option.hasClass("active")) {
            $selectText.val("").change();
            $selectValue.val("").data("option", {}).change();
            $option.removeClass("active");
            return;
          }

          var name = $option.data("name");
          $selectText.val(name && name.toString().replace(/^\s+|\s+$/, "")).change();
          $selectValue.val(value).data("option", $option.data()).change();

          if (!$select.data("show-other") && !$option.data("keyupselect")) {
            $(".J-select").removeClass("current").trigger("selecthide");
            $selectText.blur();
          } //还原


          $option.data("keyupselect", false); //附带标题

          var $parent = $option.parents(".option-group");
          var titleName;

          if ($parent.length == 0) {
            titleName = $option.parents(".J-select-option").find(".option-group").eq($option.parents(".option-group-item").index()).find(".option-group-title").data("name");
          } else {
            titleName = $parent.find(".option-group-title").data("name");
          }

          $selectParentValue.val(titleName && titleName.toString().replace(/^\s+|\s+$/, "")).change();
          $allOptions.removeClass("active");
          $option.addClass("active"); //可以取消自己
        } //多选，多列


        if ($select.hasClass("J-option-multi")) {
          handlerMutilOptionCheckbox($option.parents(".option-group-item")); //多选
        } else if ($select.hasClass("J-mutil-select")) {
          handlerMutilCheckbox(); //树形结构
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
      }).on("focus.select", ".J-select-text", function () {
        var $this = $(this);
        clearTimeout($this.data("timer"));
        $(this).parents(".J-validItem").removeClass("validError").removeClass("validSuccess");
      }).on("blur.select", ".J-select-text", function () {
        //这样可以在focus的时候清除调退出
        var $this = $(this); //多选的时候

        if ($this.parents(".J-mutil-select").length || $this.parents(".J-tree-select").length || $this.parents(".J-select-multi-tree-list").length) {
          return;
        }

        var timer = setTimeout(function () {
          $this.parents(".J-select").removeClass("current").trigger("selecthide");
          $this.parents(".J-select").find(".focusActive").removeClass("focusActive");
          console.log("tabFocus");
          $this.parents(".J-select").removeClass("tabFocus");
        }, 310);
        $this.data("timer", timer); //触发一下失去焦点

        $this.parents(".J-select").find(".J-select-value").blur();
      }).on("click.select", function (e) {
        if (!$(e.target).hasClass("J-select") && $(e.target).parents(".J-select").length == 0) {
          $(".J-select").removeClass("current").trigger("selecthide");
        } else {
          $(".J-select .J-select-text").each(function () {
            var $this = $(this);
            clearTimeout($this.data("timer"));
          });
        } //支持搜索功能，data-jp,data-qp,data-name//不能代理事件，隐藏之后（去掉current）不能触发事件

      }).find(".J-select-text").on("keyup.select", function (e) {
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
          var $select = $(this).parents(".J-select-search");
          var $selectOptionsWrap = $select.find('.J-select-option');
          var $allOptions = $selectOptionsWrap.find('.option');
          var noResultflag = true;
          $allOptions.each(function () {
            var searchStr = [$(this).data("qp") || "", $(this).data("jp") || "", $(this).data("name") || ""].join(",");

            if (searchStr.toLowerCase().indexOf(key.toLowerCase()) == -1) {
              $(this).hide();
            } else {
              $(this).show();
              noResultflag = false;
            }
          });

          if (!$select.hasClass("current")) {
            $select.addClass("current");
          }

          var noMsg = $(this).parents(".J-select-search").find('.J-select-option').data("no-result") || "无";

          if (!$select.find(".no-result-option").length) {
            $selectOptionsWrap.append("<li class='no-result-option hidden' style='padding:10px' data-value='' data-name='" + noMsg + "'>" + noMsg + "</li>");
          }

          if (noResultflag) {
            $select.find(".no-result-option").removeClass("hidden");
          } else {
            $select.find(".no-result-option").addClass("hidden");
          }
        } //空值校验

      });
      $(this).find(".J-validItem").on("change.checkEmpty", "select,input,textarea", function (e) {
        if ($.trim($(this).val())) {
          $(this).addClass("ipt-not-empty");
        } else {
          $(this).removeClass("ipt-not-empty");
        }
      }).find(".J-validItem").on("keyup.checkEmpty", "select,input,textarea", function (e) {
        if ($.trim($(this).val())) {
          $(this).addClass("ipt-not-empty");
        } else {
          $(this).removeClass("ipt-not-empty");
        }
      });
    });
  }

  var activeTabReset = true;
  var $TabTagert; //当前tab

  var stopDocumentClick = false;
  $(document).on("click.select", function (e) {
    //防止tabfocus消失之后，定位不到当前的tab操作
    if (stopDocumentClick) {
      return;
    }

    if (!$(e.target).hasClass("J-select") && $(e.target).parents(".J-select").length == 0) {
      $(".J-select").removeClass("current").trigger("selecthide");
    }

    $(".tabFocus").removeClass("tabFocus");
    $TabTagert = null;
    activeTabReset = true; // console.log("tab")
    //支持搜索功能，data-jp,data-qp,data-name
  }); //初始化按键操作

  function initFormKey() {
    var tabClass = ".J-tabItem";
    var $input = $(tabClass);
    var len = $input.length;
    var currentTabIndex = 0;
    var $currentTabSelect;
    var perIndex; //处理tab键

    function hanlderTab(e) {
      // if (e.key == "Tab") {
      if (e.keyCode * 1 == 9) {
        if ($currentTabSelect) {
          $currentTabSelect.removeClass("current");
          $currentTabSelect = null;
        }

        var activeElement;
        var $visibleInput = $input.filter(function () {
          return $(this).is(":visible");
        });

        if (activeTabReset) {
          //如果是选中了文字activeElement就会为body
          if (document.activeElement == document.body && window.getSelection) {
            activeElement = window.getSelection().anchorNode;

            if (activeElement && $(activeElement).find(tabClass).length) {
              activeElement = $(activeElement).find(tabClass)[0];
            }
          } else {
            activeElement = document.activeElement;
          }

          $visibleInput.each(function (idx) {
            if (this == activeElement || this == $(activeElement).parents(tabClass)[0]) {
              currentTabIndex = idx + 1;
              return false;
            }
          });
        } else {
          currentTabIndex++;
        }

        activeTabReset = false;

        if (currentTabIndex >= $visibleInput.length) {
          currentTabIndex = 0;
        }

        $(".tabFocus").removeClass("tabFocus");
        $TabTagert = $visibleInput.eq(currentTabIndex);
        $TabTagert.focus().addClass("tabFocus");

        if ($TabTagert.parents(".J-select").length) {
          $currentTabSelect = $TabTagert.parents(".J-select");
          $currentTabSelect.trigger(browserMobile ? "touchstart" : "mouseup");
        }

        e.stopPropagation();
        e.preventDefault();
      }
    } //设置group选中


    function setGroupFocus($select) {
      $select.data("keydir", ".option-group").removeClass("keyfocusOption").addClass("keyfocusGroup");
    } //设置group-item选中


    function setGroupItemFocus($select) {
      $select.data("keydir", ".option").removeClass("keyfocusGroup").addClass("keyfocusOption");
    } //获取当前焦点group


    function getGroupFocusOption($select) {
      var $option = $select.find(".option-group.focusActive"); //当没有focus的时候，应该选择之前选过的选项

      if ($option.length == 0) {
        $option = $select.find(".option-group.showActive");
      }

      return $option;
    } //获取当前焦点group-item


    function getGroupItemOptionParent($select) {
      var $parentOption = getGroupFocusOption($select);
      return $select.find(".option-group-item").eq($parentOption.length ? $parentOption.index() : 0);
    } //获取当前焦点的option


    function getItemOption($parent) {
      $option = $parent.find(".option.focusActive"); //当没有focus的时候，应该选择之前选过的选项

      if ($option.length == 0) {
        $option = $parent.find(".option.active");
      }

      return $option;
    } //往右键


    function handlerGroupRight($select) {
      //content焦点变化
      setGroupItemFocus($select); //获得item option

      var $parent = getGroupItemOptionParent($select);
      var $option = getItemOption($parent); //item焦点变化

      $select.find(".option.focusActive").removeClass("focusActive");

      if ($option.length == 0) {
        $parent.find(".option").eq(0).addClass("focusActive");
      } else {
        $option.addClass("focusActive");
      }
    } //往左键


    function handlerGroupLeft($select) {
      //content焦点变化
      setGroupFocus($select); //group焦点变化

      hanlderGroupDir($select, "self"); //item焦点变化

      $select.find(".option.focusActive").removeClass("focusActive");
    } //往上键-group


    function handlerGroupUp($select) {
      hanlderGroupDir($select, "prev");
    } //往下键-group


    function hanlderGroupDown($select) {
      hanlderGroupDir($select, "next");
    } //如果有滚动条那么就显示出来


    function scrollVisiable($content, $active) {
      var conHeight = $content.height();
      var conTop = $content.offset().top;
      var activeTop = $active.offset().top;
      var activeHeight = $active.height() + (parseFloat($active.css("padding-top"), 10) || 0) + (parseFloat($active.css("padding-top"), 10) || 0);

      if (conHeight < activeTop - conTop + activeHeight) {
        $content.scrollTop(activeTop - conTop - conHeight + activeHeight + $content.scrollTop());
      } else if (activeTop - conTop < 0) {
        $content.scrollTop(activeTop - conTop + $content.scrollTop());
      }
    } //处理group上下和自己的方向


    function hanlderGroupDir($select, dir) {
      var $parentOption = getGroupFocusOption($select);

      if ($parentOption.length == 0) {
        $select.find(".option-group").first().trigger("mouseenter").addClass("focusActive");
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
              $parentOption.next().trigger("mouseenter").addClass("focusActive");
              ;
            } else {
              $select.find(".option-group").first().trigger("mouseenter").addClass("focusActive");
              ;
            }

            break;

          default:
            $parentOption.trigger("mouseenter").addClass("focusActive");
            ;
        }
      }

      scrollVisiable($select.find(".option-group-content"), $select.find(".option-group.focusActive"));
    } //处理item上下和自己的方向


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
              $option.next().addClass("focusActive"); //老行业样式,且不是项目zi'x
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
    } //处理多列的方向问题


    function handlerMuitlDir(e, $select) {
      var currentDir = $select.data("keydir") || ".option-group";
      var skip = false;

      if (!currentDir) {
        setFoucsGroup($select);
      } // if (e.key == "ArrowRight") {


      if (e.keyCode * 1 == 39) {
        handlerGroupRight($select);
      } else if (e.keyCode * 1 == 37) {
        handlerGroupLeft($select); //确认
      } else {
        if (currentDir == ".option-group") {
          if (e.keyCode * 1 == 38) {
            handlerGroupUp($select);
          } else if (e.keyCode * 1 == 40) {
            hanlderGroupDown($select);
          } else {
            skip = true;
          }
        } else {
          skip = hanlderOptionDir(e, getGroupItemOptionParent($select));
        }

        return skip;
      }
    } //处理option的上下


    function hanlderOptionDir(e, $parent) {
      var $option = getItemOption($parent);
      var skip;

      if (e.keyCode * 1 == 38) {
        hanlderItemDir($option, $parent, "prev");
      } else if (e.keyCode * 1 == 40) {
        hanlderItemDir($option, $parent, "next");
      } else {
        skip = true;
      }

      return skip;
    } //处理上下和左右入口


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

        if (e.keyCode * 1 == 13) {
          $select.find(".option.focusActive").data("keyupselect", true).trigger("click");
          $select.toggleClass("current");
          return; //空格选中
        }

        if ($select.hasClass("current")) {
          if (e.keyCode * 1 == 32) {
            $select.find(".option.focusActive").data("keyupselect", true).trigger("click");
            skip = false;
          } else if ($select.hasClass("J-select-multi-list") || $select.hasClass("J-select-multi-tree-list")) {
            skip = handlerMuitlDir(e, $select);
            $select.find(".option.focusActive").data("keyupselect", true).trigger("click");
          } else {
            skip = hanlderOptionDir(e, $select);

            if (!$select.hasClass("J-mutil-select")) {
              $select.find(".option.focusActive").data("keyupselect", true).trigger("click");
            }
          }
        } else {
          if (e.keyCode * 1 == 40) {
            $select.addClass("current");
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
          e.preventDefault(); //上下键
        } else if (isRadio || isRadioParent) {
          if (e.keyCode * 1 == 38 || e.keyCode * 1 == 37) {
            if ($t.prev().length) {
              $t.prev().focus().trigger("click");
            } else {
              $t.focus().trigger("click");
            }

            e.stopPropagation();
            e.preventDefault();
            $(".tabFocus").removeClass("tabFocus");
          } else if (e.keyCode * 1 == 40 || e.keyCode * 1 == 39) {
            if ($t.next().length) {
              $t.next().focus().trigger("click");
            } else {
              $t.focus().trigger("click");
            }

            e.stopPropagation();
            e.preventDefault();
            $(".tabFocus").removeClass("tabFocus");
          }
        }
      }
    } //监听tab


    $input.on("keydown", function (e) {
      hanlderTab(e); //阻止默认行为

      var $t = $(this);
      var isRadio = $t.hasClass("form-radio");
      var isRadioParent = $t.find("input.form-radio").length;

      if ($t.parents(".J-select").length || $t.hasClass(".J-select")) {
        // if (e.key == "ArrowDown" || e.key == "ArrowUp") {
        if (e.keyCode * 1 == 40 || e.keyCode * 1 == 38) {
          e.stopPropagation();
          e.preventDefault();
        }
      }

      if (isRadio || isRadioParent) {
        if (e.keyCode * 1 == 40 || e.keyCode * 1 == 38 || e.keyCode * 1 == 37 || e.keyCode * 1 == 39) {
          // if(e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "ArrowLeft"  ||e.key == "ArrowRight"  ) {
          e.stopPropagation();
          e.preventDefault();
        } //单选框


        if (e.keyCode * 1 == 32) {
          //"space"
          e.stopPropagation();
          e.preventDefault();
        }
      }
    });
    $(document).on("keydown", function (e) {
      hanlderTab(e);
    });
    $input.on("keyup", function (e) {
      stopDocumentClick = true;
      hanlderDir(e, $TabTagert || $(this));
      stopDocumentClick = false;
    });
  } //移动端配置项----------------


  var uuid = 0;

  function initConfig($this) {
    var offset = $this.data("offset");
    var position = $this.data("position");
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
    };
    return config;
  } //移动端


  function initmobileselect($this) {
    var config = initConfig($this);

    if ($this.hasClass("J-select-multi-list") || $this.hasClass("J-select-multi-tree-list")) {
      var data = $this.data("data");
      var parentData = parseParentDate(data);
      var subData = parseSubDate(data);
      new MobileSelect($.extend(config, {
        wheels: [{
          data: parentData
        }]
      }));
    } else if ($this.hasClass("J-mutil-select")) {
      var data = $this.data("data");
      var subData = parseSubDate(data);
      new MobileSelect($.extend(config, {
        multiple: true,
        wheels: [{
          data: subData
        }]
      }));
    } else {
      var data = $this.data("data");
      var subData = parseSubDate(data);
      new MobileSelect($.extend(config, {
        wheels: [{
          data: subData
        }]
      }));
    }
  } //----------------------------------------------------------


  function parseParentDate(data) {
    var newData = [];

    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var obj = {
        id: uuid++,
        value: item.name
      };

      if (item.data) {
        obj.childs = [];

        for (var j = 0; j < item.data.length; j++) {
          var subItem = item.data[j];
          obj.childs.push({
            id: uuid++,
            value: subItem.name,
            selectAll: item.selectAll
          });
        }
      }

      newData.push(obj);
    }

    return newData;
  } //----------------------------------------------------------


  function parseSubDate(data) {
    var newData = [];

    for (var i = 0; i < data.length; i++) {
      var item = data[i];
      var obj = {
        id: uuid++,
        value: item.value,
        name: item.name,
        selectAll: item.selectAll
      };
      newData.push(obj);
    }

    return newData;
  } //移动端


  function initWapSelect() {
    //只有trigger 和 wheels 是必要参数  其他都是选填参数
    $(".J-select").each(function (params) {
      var $this = $(this); //如果没有MobileSelect或者没有使用J-mobile-select，将不会初始化移动端的样式

      if (!MobileSelect || !$(this).hasClass("J-mobile-select") || $(this).data("data-ready-init")) {
        return;
      } //提前初始化了


      if ($this.data("data-ready")) {
        initmobileselect($this);
      } else {
        $this.on("data-ready", function () {
          initmobileselect($this);
        });
      }
    });
    initMobileData();
    $(".J-mobile-select.staticData").trigger("data-ready").data("data-ready", true);
  } //-----------------------------------


  function initMobileData() {
    //静态项
    $(".J-mobile-select.staticData").each(function () {
      var data = [];
      $(this).find(".option").each(function () {
        if ($(this).find(".J-select-all-ipt").length) {
          data.push({
            value: $(this).data("value"),
            name: $(this).data("name"),
            selectAll: true
          });
        } else {
          data.push({
            value: $(this).data("value"),
            name: $(this).data("name")
          });
        }
      });
      $(this).data("data", data);
    });
  }

  function initHoverMulti() {
    //对列项
    $(".J-select-multi-list,.J-select-multi-tree-list").each(function () {
      var $this = $(this);

      if ($this.data("data-ready")) {
        hover();
      } else {
        $this.on("data-ready", hover);
      }

      function hover() {
        if ($this.data("data-ready-hover-init")) {
          return;
        }

        $this.data("data-ready-hover-init", true);

        if ($.fn.mouseHover) {
          $this.mouseHover(".option-group", function () {
            $this.find(".showActive").removeClass("showActive");
            $(this).addClass("showActive");
            $this.find(".ipt-text").addClass("force-focus");
            var index = $(this).index();
            $this.find(".option-group-item").eq(index).addClass("showActive");
            resetWidth($this);
          }, function () {
            $this.find(".ipt-text").removeClass("force-focus");
          });
        }

        $this.find(".option-group").eq(0).addClass("showActive");
        $this.find(".option-group-item").eq(0).addClass("showActive"); // $this.addClass("current")

        resetWidth($this); // $this.removeClass("current")
      }
    });
  }

  function getScrollbarWidth() {
    var $odiv = $("<div id='testScrollWidth' class='coustom-scroll' style='position:absolute;top:-100px;width:100px;height:100px;overflow-y:scroll'>&nbsp;</div>").appendTo("body"); //创建一个div

    var odiv = $odiv[0];
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
      fixWidth = scrollbarWidth;
    }

    if (minHeight > $right.height()) {
      $right.addClass("minHeight");
    }

    if ($right.width() >= maxWidth / 2) {
      $right.addClass("allowBreakWord");
    }

    if ($left.width() >= maxWidth / 2) {
      $left.addClass("allowBreakWord");
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

  $(function () {
    if ($(window).width() < 992) {
      initWapSelect();
    } else {
      initFormKey();
    }

    initSelect();
    initHoverMulti();
    $(".form-group").each(function (idx) {
      $(this).find(".ipt-wrap").addClass("level" + idx);
    });
  });
})(RBT.dom, window.undefined);

;
/* dialog 0.0.1 (Custom Build) | MIT & BSD
 * Build: 
 */

(function ($) {
  //功能参数
  var settings = {
    title: "",
    //无标题
    mask: true,
    //非模态（无遮罩）
    maskClose: true,
    time: 0,
    //不自动关闭
    draggable: false,
    draggableTrigger: "",
    draggableResize: false,
    close: true,
    // button:[{text:"确定",click:function(){},type:"warn",style:""}],
    animateType: "fadeTop",
    closeStyle: "",
    headerStyle: "",
    // dialogClass:"",为dialog添加样式
    zindex: 1000,
    frameType: "dialog",
    frame: null,
    width: "auto",
    //兼容之前代码
    height: "auto",
    //兼容之前代码
    closeAfter: null,
    //关闭之前
    closeBefore: null,
    //关闭之后
    changeSize: false,
    //调节宽高
    structureReady: null,
    //根结构渲染了
    minTop: 20,
    ready: null //dialog的dom已经初始化
    //headerStyle,titleStyle,closeStyle,bodyStyle,maskStyle
    //renderAfter

  };

  if (!$.i18n) {
    $.i18n = function (key) {
      return key;
    };
  } //dialog初始化程序入口
  // dialog($(".data"))-->弹出一个默认窗口
  //dialog("msg",opts)


  function Dialog(content, opts) {
    //默认html结构
    var $dialog = get$("dl-" + opts.frameType);
    var $header = get$("dl-header");
    var $title = get$("dl-title");
    var $close = get$("dl-close").html("×");
    var $body = get$("dl-body");
    var $footer = get$("dl-footer"); // var $loading = get$("dl-load");

    var $mask = get$("dl-mask"); //创建一次 dl-mask全局

    var $css = get$("dl-css"); //创建一次 dl-mask全局

    var $js = get$("dl-js"); //创建一次 dl-mask全局
    //dialog 避免id

    if (/\s+id\s*=\s*"?'?\s*(\w+)\s*'?"?(\s|>)/.test(content.replace(/\s+/mg, " "))) {
      console.log("warn dialog has id=", RegExp["$1"]);
    } //添加dialog标识


    if (opts.id) {
      $dialog.attr("id", opts.id);
    }

    renderStructure($mask, $dialog, opts);

    if (content.match(/^url:(.*)$/ig)) {
      var action = $.trim(RegExp.$1);
      $dialog.addClass("loading");
      $body.load(action, function () {
        PAGE.loadFile(action.replace(".html", ".css?ver=" + PAGE.version), "link", function () {
          $dialog.removeClass("loading");
          initDialog($dialog, $header, $title, $close, $body, $footer, $mask, opts);

          if (window.PAGE.STATICDEBUG) {
            var s = document.createElement("script");
            s.type = "text/javascript";
            $body.append(s); //应该在append之后赋值

            s.src = action.replace(".html", ".js?ver=" + PAGE.version);
          }
        }, $dialog, $dialog);
      });
    } else {
      $body.html(content);
      initDialog($dialog, $header, $title, $close, $body, $footer, $mask, opts);
    }

    return $dialog;
  }

  function initDialog($dialog, $header, $title, $close, $body, $footer, $mask, opts) {
    //渲染dialog
    renderDialog($dialog, $header, $title, $close, $body, $footer, $mask, opts); //初始化dialog功能

    runDialog($dialog, opts);
    opts.frame = $dialog[0];
    $dialog.data("opts", opts);
    $.dialog.dlOpts.push(opts);

    if (typeof opts.ready == "function") {
      opts.ready($dialog, opts);
    }
  } //渲染结构


  function renderStructure($mask, $dialog, opts) {
    if (opts.mask) {
      $mask.appendTo('body').show();
    }

    $dialog.appendTo('body');

    if (typeof opts.structureReady == "function") {
      opts.structureReady($dialog);
    }
  } //渲染dialog


  function renderDialog($dialog, $header, $title, $close, $body, $footer, $mask, opts) {
    var dialogIndex = ";z-index:" + (opts.zindex * 1 + ($.dialog.dlOpts.length * 2 + 1)) + ";"; //--dl-mask----------------------

    if (opts.mask) {
      //层次问题,dl-mask紧跟最上面的dialog,zindex基点
      var maskIndex = ";z-index:" + (opts.zindex * 1 + $.dialog.dlOpts.length * 2) + ";";
      renderStyle($mask, "" + maskIndex + (opts.maskStyle || ""));
      opts.$mask = $mask;
    } //标题--dl-header----------------------


    if (opts.title) {
      $header.append($title.html($.i18n(opts.title))); //头部样式

      renderStyle($header, "" + (opts.headerStyle || ""));
      renderStyle($title, "" + (opts.titleStyle || "")); //已title为最小宽度

      var $test = $("<div style='position:absolute;left:-1000px;'></div>").html($header[0].outerHTML).appendTo('body');
      $header.css("min-width", $test.width());
      $test.remove();
      $header.appendTo($dialog);
    } //--dl-dialog 样式------------------


    if (opts.dialogClass) {
      $dialog.addClass(opts.dialogClass);
    }

    renderStyle($dialog, "position:absolute;" + dialogIndex + (opts.dialogStyle || "")); //--dl-body 样式------------------
    //兼容之前代码

    if (opts.width != "auto") {
      var w = parseFloat($.trim(opts.width), 10) + "px";
    }

    if (opts.height != "auto") {
      var h = parseFloat($.trim(opts.height), 10) + "px";
    }

    var oldBodyCode = "width:" + (w ? w : opts.width) + ";" + "height:" + (h ? h : opts.height) + ";padding:15px;";
    renderStyle($body, oldBodyCode + (opts.bodyStyle || ""));
    $dialog.append($body); //标题--dl-close----------------------

    if (opts.close) {
      //关闭样式
      var titleHasClose;

      if (opts.title) {
        titleHasClose = "right:-1px;top:0;color: #cb0101;font-size:28px;line-height:38px;width:42px;height:42px;";
      } else {
        titleHasClose = "background-color:#fff;right: 10px;top: 4px;width: 24px;line-height: 20px;height: 24px;font-size: 24px;";
      }

      if (typeof opts.close == "string" && $(opts.close).length) {
        $close = $dialog.find(opts.close).addClass('dl-close');
      } else {
        renderStyle($close, "position:absolute;left:auto;cursor:pointer;text-align:center;" + titleHasClose + (opts.closeStyle || ""));
        $dialog.append($close);
      }
    } //console.log( $close)
    //--dl-footer 样式-------------------


    if (opts.button && opts.button.length) {
      renderStyle($footer, opts.footerStyle || "");

      for (var i = 0; i < opts.button.length; i++) {
        var $btn = $("<a class='btn btn-primary btn-m dl-bottom'>" + opts.button[i].text + "</a>");

        if (opts.button[i].className) {
          $btn.addClass(opts.button[i].className);
        }

        renderStyle($btn, opts.button[i].buttonStyle || "");
        opts.button[i].btn = $btn;
        $footer.append($btn);
      }

      $footer.appendTo($dialog);
    }

    setCenter($dialog, opts);

    if (typeof opts.renderAfter == "function") {
      opts.renderAfter($dialog, opts, $header, $title, $close, $body, $footer, $mask);
    }
  } //dialog执行，添加功能


  function runDialog($dialog, opts) {
    var close = function close(e) {
      $.dialog.close($dialog, e);
    }; //公用mask必须每次都重新绑定或者去绑定


    if (opts.maskClose && opts.$mask) {
      opts.$mask.on("click", function (e) {
        close(e);
      });
    }

    if (opts.changeSize && $.fn.changeSize) {
      $dialog.changeSize("enable");
    } //按钮


    if (opts.button && opts.button.length) {
      for (var i = 0; i < opts.button.length; i++) {
        ;

        (function (idx) {
          opts.button[idx].btn.click(function (e) {
            if (typeof opts.button[idx].click == "function") {
              if (opts.button[idx].click(e, $dialog) === false) {
                return;
              }
            }

            close(e);
          });
        })(i);
      }
    }

    $dialog.on("click", ".dl-close,.dl-btn", close);
    $dialog.on("setcenter", function () {
      setCenter($dialog, opts);
    });

    if (opts.draggable) {
      if (typeof opts.draggableTrigger == "string" && $dialog.find(opts.draggableTrigger).length) {
        initDraggable($dialog.find(opts.draggableTrigger), $dialog);
      } else if (opts.title) {
        initDraggable($dialog.find(".dl-header"), $dialog);
      } else {
        initDraggable($dialog, $dialog);
      }

      if (!opts.draggableResize) {
        $dialog.addClass('dl-noresize');
      }
    }

    if (opts.time) {
      $.dialog.timeout($dialog, opts.time);
    }

    if (opts.animateType && $.dialog[opts.animateType]) {
      $.dialog[opts.animateType]($dialog);
    } else {
      $dialog.show();
    }
  } //对外提供接口$.tips $.alert $.comfirm


  $.extend($, {
    dialog: function dialog(content, opts) {
      if ($.type(content) == "object") {
        //匹配jq对象
        if (typeof content.html == "function") {
          content = content.html(); //匹配设置项
        } else {
          opts = content;
          content = $.i18n(opts.msg) || "";
        }
      } //确保opts是个对象


      opts = $.extend(true, {}, settings, opts);
      return new Dialog(content, opts);
    },
    tips: function tips(msg, type, time, callback) {
      var opts = {};

      if (typeof time == "function") {
        callback = time;
        time = 3000;
      }

      if (_typeof(type) == "object") {
        opts = type;
      } else {
        opts = {
          type: type,
          time: time,
          closeAfter: callback
        };
      }

      opts = $.extend(true, {
        type: "warn",
        time: 3000,
        zindex: 2000,
        frameType: "tips",
        maskClose: true
      }, opts);

      if (opts.reload === true) {
        opts.reload = function () {
          window.location.reload();
        };
      }

      var content = '<div class="dl-tips-{0}"><i class="dl-tips-img"></i><span class="dl-tips-text">{1}</span></div>'.tpl(opts.type, msg);
      return new Dialog(content, opts);
    }
  });
  /*自己调用只能调用一次，不然会出现死循环*/

  function destroyDialog(obj) {
    var newDestroy = [];

    for (var i = 0; i < obj.destroy.length; i++) {
      if (typeof obj.destroy[i] == "function") {
        //注意顺序，相同的destroy是不会被执行的
        if (newDestroy.indexOf(obj.destroy[i]) == -1 && obj.destroy[i]() != true) {
          newDestroy.push(obj.destroy[i]);
        }
      }
    }

    obj.destroy = newDestroy;
  } //dialog默认全局属性和方法


  $.extend($.dialog, {
    dlOpts: [],
    timeout: function timeout($target, time) {
      var that = this;
      setTimeout(function () {
        that.close($target);
      }, time);
    },
    //删除一个触发
    closeOnebefore: function closeOnebefore(idx, e) {
      //外部定义closebefore
      if (this.dlOpts[idx] && typeof this.dlOpts[idx].closeBefore == "function") {
        //返回flase不关闭 this指向当前参数
        return this.dlOpts[idx].closeBefore($(this.dlOpts[idx].frame), e);
      }
    },
    //删除一个触发
    closeOneAfter: function closeOneAfter(idx) {
      if (this.dlOpts[idx]) {
        if (typeof this.dlOpts[idx].closeAfter == "function") {
          this.dlOpts[idx].closeAfter($(this.dlOpts[idx].frame));
        }

        if (typeof this.dlOpts[idx].reload == "function") {
          this.dlOpts[idx].reload($(this.dlOpts[idx].frame));
        }
      }
    },
    //始终会触发
    before: function before(e) {
      if (typeof this.closebefore == "function") {
        return this.closebefore(e);
      }
    },
    //始终会触发
    after: function after(e) {
      if (typeof this.closeCallBack == "function") {
        this.closeCallBack(e);
      }

      $(".err-tips").remove();
    },
    //获得dialog的索引
    getOptsIndex: function getOptsIndex($dialog) {
      for (var i = 0; i < this.dlOpts.length; i++) {
        if (this.dlOpts[i].frame == $dialog[0]) {
          return i;
        }
      }

      return -1;
    },

    /*全部统一处理*/
    destroy: [],
    //type ==all 时只要idx在其中就可以删除，否则匹配到type类型就删除 type="all,dialog,alert,tips,confirm"
    delDl: function delDl(type, idx, e) {
      if (idx > -1 && idx < this.dlOpts.length && (this.dlOpts[idx].frameType == type || type == "all")) {
        //参数上关闭
        if (this.closeOnebefore(idx, e) === false) {
          return false;
        }
        /*dom 删除时调用*/


        var $self = $(this.dlOpts[idx].frame); //dom上的关闭

        if (typeof $self[0].destroy == "function") {
          if ($(this.dlOpts[idx].frame)[0].destroy() === false) {
            return false;
          }
        }

        var $mask = this.dlOpts[idx].$mask;

        if ($mask && $mask.length) {
          $mask.remove();
        }

        $(this.dlOpts[idx].frame).remove();
        this.closeOneAfter(idx);
        this.dlOpts.splice(idx, 1);
        return true;
      }

      return false;
    },
    close: function close($dialog, e) {
      //返回flase不关闭
      if (this.before(e) === false) {
        return;
      }

      destroyDialog($.dialog);
      this.delDl("all", this.getOptsIndex($dialog), e);
      this.after(e);
    },
    closeAll: function closeAll(type) {
      //返回flase不关闭
      if (this.before() === false) {
        return;
      }

      ;
      type = type || "dialog";

      for (var i = 0; i < this.dlOpts.length; i++) {
        if (this.delDl(type, i) == true) {
          i--; //指针回游
        }
      }

      this.after();
    },
    closeLast: function closeLast(type) {
      //返回flase不关闭
      if (this.before() === false) {
        return;
      }

      ;
      type = type || "dialog";

      for (var i = this.dlOpts.length - 1; i >= 0; i--) {
        //如果是关闭类型为type或者全部删除
        if (this.delDl(type, i) == true) {
          break; //删除一次指针不用回
        }
      }

      this.after();
    },
    closeFrist: function closeFrist(type) {
      //返回flase不关闭
      if (this.before() === false) {
        return;
      }

      ;
      type = type || "dialog";

      for (var i = 0; i < this.dlOpts.length; i++) {
        //如果是关闭类型为type或者全部删除
        if (this.delDl(type, i) == true) {
          break; //删除一次指针不用回
        }
      }

      this.after();
    },
    getCenter: function getCenter($target) {
      var w = $target.width(),
          h = $target.height();
      var innerH = getInnerHeight(),
          innerW = getInnerWidth();
      var left = $target.parent().offset().left,
          top = $target.parent().offset().top;
      var x = getFloat($target.css("left")),
          y = getFloat($target.css("top"));
      var scrollTop = $(window).scrollTop();
      var scrollLeft = $(window).scrollLeft();
      var dw = innerW - w;
      var dh = innerH - h;
      dw = dw < 0 ? 0 : dw;
      dh = dh < 0 ? 0 : dh;

      if ($target.css("position") == "absolute") {
        x = dw / 2 + scrollLeft - left;
        y = dh / 2 + scrollTop - top;
      } else {
        x = dw / 2;
        y = dh / 2;
      }

      return {
        x: x,
        y: y,
        isoverY: dh == 0 ? true : false,
        isoverX: dw == 0 ? true : false,
        isTop: y == scrollTop ? true : false,
        isLeft: x == scrollLeft ? true : false
      };
    },
    fadeTop: function fadeTop($target) {
      var top = $target.css("top");
      $target.css("top", 0);
      $target.animate({
        top: top
      }, 200);
    }
  }); //获取窗口内部高度

  function getInnerHeight() {
    return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body.clientHeight;
  } //获取窗口内部宽度


  function getInnerWidth() {
    return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body.clientWidth;
  } //使用call设置居中


  function setCenter($target, opts) {
    $target.each(function () {
      var $this = $(this);
      opts = opts || $this.data("opts");
      var center = $.dialog.getCenter($target);

      if (center.isTop && opts && opts.minTop) {
        center.y = center.y + opts.minTop;
      }

      $target.stop(true, true);

      if ((center.isoverY || center.isoverX) && $target.data("setcenter")) {
        if (center.y < parseFloat($this.css("top"), 10)) {
          $this.css({
            top: center.y
          });
        }

        if (center.x < parseFloat($this.css("left"), 10)) {
          $this.css({
            left: center.x
          });
        }
      } else {
        if (opts.frameType == "dialog") {
          $this.css({
            top: PAGE && PAGE.dialogTop ? $(window).scrollTop() + opts.minTop : center.y,
            left: center.x
          });
        } else {
          $this.css({
            top: center.y,
            left: center.x
          });
        }
      }

      $target.data("setcenter", true);
    });
  } //获得浮点数


  function getFloat(str) {
    return parseFloat($.trim(str), 10) || 0;
  } //窗口大小改变时始终保持居中


  var initResize = function () {
    var perHeight = 0;
    var timer;
    $(window).resize(function () {
      if (Math.abs(getInnerHeight() - perHeight) > 10) {
        $(".dl-dialog").add(".dl-confirm").add(".dl-tips").add(".dl-alert").not(".dl-noresize").each(function () {
          setCenter($(this));
        });
        preHeight = getInnerHeight();
      }
    }).scroll(function () {
      clearTimeout(timer);
      setTimeout(function () {
        $(".dl-dialog").add(".dl-confirm").add(".dl-tips").add(".dl-alert").not(".dl-noresize").each(function () {
          setCenter($(this));
        });
      }, 200);
    });
  }.call(); // 将font-size:12px;text-align:center;解析为对象


  function getStyleObject(str) {
    var obj = {};
    var str = str.split(";");
    var temp;

    for (var i = 0; i < str.length; i++) {
      if (str[i]) {
        temp = str[i].split(":");

        if (temp.length == 2) {
          obj[$.trim(temp[0])] = temp[1];
        }
      }
    }

    return obj;
  } //创建一个指定className的div


  function get$(className) {
    return $("<div></div>").addClass(className);
  } //dialog窗口实体样式


  function renderStyle($target, style) {
    $target.css(getStyleObject(style));
  } //初始化拖动功能


  function initDraggable($trigger, $target) {
    if ($trigger.length == 0 && $target.length == 0) {
      return console.log("draggable false by not find trigger or target");
    }

    var Jmove = {}; //处理移动

    function handleMouseup(e) {
      Jmove.down = false;
      $(document).off("selectstart").on('mousemove', handleDraggable).off("mouseup", handleMouseup);
    } //处理移动


    function handleDraggable(e) {
      var x = event.pageX;
      var y = event.pageY;
      $(".dl-drag").each(function () {
        var $this = $(this);

        if (Jmove.down) {
          $this.css({
            left: x - Jmove.dx + Jmove.px,
            // $this.data("dx") + $this.data("px"),
            top: y - Jmove.dy + Jmove.py // $this.data("dy") + $this.data("py")

          });
        }
      });
    }

    $target.addClass('dl-drag');
    $trigger.css("cursor", "move").on('mousedown', function (event) {
      Jmove = {
        dx: event.pageX,
        dy: event.pageY,
        px: parseInt($target.css("left")) || 0,
        py: parseInt($target.css("top")) || 0,
        down: true
      };
      $(document).on('mousemove', handleDraggable).on("mouseup", handleMouseup).on("selectstart", function () {
        return false;
      });
    });
  }
})(RBT.dom);

;
;

(function ($) {
  var host = window.location.host.split(":")[0];
  var defaultUrl = "ws://" + host;
  var rapSendQueue = [];
  var rapSendQueueMap = {};
  var socketSendUUid = 0;
  var ws;

  function initSocket(port) {
    if (!port) {
      $.tips("sookie not find port", "danger", 1000);
      return;
    }

    ws = {};

    if (window.WebSocket) {
      ws = new WebSocket(defaultUrl + ":" + port);
    }

    ws.onopen = function (e) {
      ws.rapStatus = "open";
      ws.rapsendMsg();
    };

    ws.onclose = function (e) {
      var len = rapSendQueue.length;

      while (len--) {
        var currQueue = rapSendQueue[len];
        currQueue.error("web socket close");
      }
    };

    ws.onerror = function () {
      console.log("web socket error");
      var len = rapSendQueue.length;

      while (len--) {
        var currQueue = rapSendQueue[len];
        currQueue.error("web socket error");
      }
    };

    ws.onmessage = function (e) {
      if (e.data) {
        try {
          var data = JSON.parse(e.data);

          if (data.sendId != null && rapSendQueueMap[data.sendId]) {
            if (data.type !== "error") {
              rapSendQueueMap[data.sendId].success(data.message);
            } else {
              rapSendQueueMap[data.sendId].error(data.message);
            }
          } else if (data.type !== "error") {
            $.each(rapSendQueue, function (idx, val) {
              val.error(data.message);
            });
          } else {
            $.each(rapSendQueue, function (idx, val) {
              val.success(data.message);
            });
          }
        } catch (e) {
          console.log("socket error return");
        }
      }
    };

    ws.rapsendMsg = function () {
      var len = rapSendQueue.length;

      while (len--) {
        var currQueue = rapSendQueue[len];

        if (currQueue.status == "ready") {
          var message = {
            type: currQueue.type,
            data: currQueue.data,
            id: currQueue.id,
            sendId: currQueue.sendId,
            url: currQueue.url
          };

          if (currQueue.type == "action") {
            if (!currQueue.url) {
              currQueue.error("not find url");
            }
          } else if (currQueue.type == "chat") {
            if (!currQueue.id) {
              currQueue.error("chat no body");
            }
          }

          currQueue.status = "sending";
          ws.send(JSON.stringify(message));
        }
      }
    };
  }

  RBT.socketSend = function (opts, uuid) {
    if (!ws) {
      initSocket(opts.port);
    }

    var queue;

    if (uuid != null && (queue = rapSendQueueMap[uuid]) && queue.url == opts.url) {
      queue.data = opts.data;
      queue.id = opts.id;
      queue.status = "ready";
    } else {
      queue = {
        success: opts.success || function (e) {
          console.log("success", e);
        },
        error: opts.error || function (msg) {
          console.log(msg);
        },
        type: opts.type,
        sendId: socketSendUUid++,
        status: "ready",
        id: opts.id,
        data: opts.data,
        url: opts.url
      };
      rapSendQueue.push(queue);
      rapSendQueueMap[queue.sendId] = queue;
    }

    if (ws.rapStatus == "open") {
      ws.rapsendMsg();
    }

    return queue.sendId;
  };
})(RBT.dom);

;
;

(function ($, resizeStack) {
  /**
   author:robert
   date:2018-12-07
   description:	Chart factory function
   **/
  var Chart = function Chart(opts, canvas, wrap) {
    this.canvas = canvas;
    this.c = canvas.getContext("2d");
    this.wrap = wrap;
    this.width = $(wrap).width();
    this.height = $(wrap).height();
    this.clear();
    this.opts = $.extend(true, {}, opts);
    this.axis = this.opts && this.opts.axis;
    this.data = this.opts && this.opts.data;
    this.stack = [];
    this.parseAxisStyle();
    this.draw();
    resizeStack.push({
      fn: this.resize,
      context: this,
      params: []
    });
  };
  /**
   author:robert
   date:2018-12-08
   description:	resize
   **/


  Chart.prototype.resize = function () {
    this.width = $(this.wrap).width();
    this.height = $(this.wrap).height();
    this.redraw();
  };
  /**
   author:robert
   date:2018-12-08
   description:	redraw
   **/


  Chart.prototype.redraw = function (opts) {
    this.clear();
    this.stack = [];
    this.opts = $.extend(true, this.opts, opts);
    this.axis = this.opts && this.opts.axis;
    this.data = this.opts && this.opts.data;
    this.parseAxisStyle();
    this.draw();
  };
  /**
   author:robert
   date:2018-12-08
   description:	draw line chart
   **/


  function getTextWidth(text, fontsize, xformat) {
    if (xformat) {
      text = xformat(text);
    }

    var $test = $(".test-text");

    if (!$test.length) {
      $test = $("<span></span>").appendTo("body");
      $test.attr("style", "visibility: hidden;position:absolute;left:-100%").attr("class", "test-text");
    }

    $test.css("font-size", fontsize).html(text);
    return $test.width();
  }
  /**
   author:robert
   date:2018-12-08
   description: parseAxisX
   **/


  Chart.prototype.parseAxisX = function (style) {
    var x = this.axis.x;

    if (!x) {
      return console.error("error:not find axis x");
    }

    var xstyle = this.parseStyle(this.axis.xstyle);
    var xformat = this.axis.xformat;
    var len = x.length;
    var xdataType = "number";
    var index = -1;

    for (var i = 0; i < len; i++) {
      var itemX = xstyle["left"] + (i + 1) / len * xstyle["width"];
      var itemXText = itemX - getTextWidth(x[i], xstyle["font-size"], xformat);
      getLineStack(itemX, style["top"] + style["height"], itemX, style["top"] + style["height"] - 5, style["border-bottom-color"], "solid", style["border-bottom-width"], this.stack);
      getTextStack(x[i], itemXText, xstyle["top"], xstyle["color"], xstyle["font-size"], this.stack, xformat);

      if (typeof x[i] == "string") {
        xdataType = "string";
      }
    } //解析数据


    var xdata = this.data.x;
    var xdataPx = [];

    if (xdataType == "number") {
      x.sort(function (a, b) {
        return a - b < 0 ? -1 : 1;
      });
    }

    for (i = 0; i < xdata.length; i++) {
      if (xdataType == "number") {
        if (x[len - 1] < xdata[i]) {
          xdata[i] = x[len - 1];
        }

        if (x[0] > xdata[i]) {
          xdata[i] = x[0];
        }

        xdataPx.push((xdata[i] - x[0]) / (x[len - 1] - x[0]) * xstyle["width"] + xstyle["left"] + 1);
      } else {
        index = x.indexOf(xdata[i]);

        if (index != -1) {
          xdataPx.push(xstyle["left"] + index / len * xstyle["width"]);
        } else {
          xdataPx.push(xstyle["left"]);
        }
      }
    }

    return xdataPx;
  };
  /**
   author:robert
   date:2018-12-08
   description: parseAxisY
   **/


  Chart.prototype.parseAxisY = function (style) {
    var y = this.axis.y;

    if (!y) {
      console.error("no axis y");
      return;
    }

    var ystyle = this.parseStyle(this.axis.ystyle);
    var yformat = this.axis.yformat;
    var ydataType = "number";
    var index;
    var len = y.length;

    for (var i = len - 1; i >= 0; i--) {
      var itemY = ystyle["top"] + (i + 1) / len * ystyle["height"];
      getLineStack(style["left"], itemY, style["left"] + 5, itemY, style["border-left-color"], "solid", style["border-left-width"], this.stack);
      getTextStack(y[len - 1 - i], ystyle["left"], itemY, ystyle["color"], ystyle["font-size"], this.stack, yformat);

      if (typeof y[i] == "string") {
        ydataType = "string";
      }
    } //解析数据


    var ydata = this.data.y;
    var ydataPx = [];

    if (ydataType == "number") {
      y.sort(function (a, b) {
        return a - b < 0 ? -1 : 1;
      });
    }

    for (i = 0; i < ydata.length; i++) {
      if (ydataType == "number") {
        if (y[len - 1] < ydata[i]) {
          ydata[i] = y[len - 1];
        }

        if (y[0] > ydata[i]) {
          ydata[i] = y[0];
        }

        ydataPx.push(ystyle["top"] + (y[len - 1] - ydata[i]) / (y[len - 1] - y[0]) * ystyle["height"]);
      } else {
        index = y.indexOf(ydata[i]);

        if (index != -1) {
          ydataPx.push(ystyle["top"] + index / len * ystyle["height"]);
        } else {
          ydataPx.push(0);
        }
      }
    }

    return ydataPx;
  };
  /**
   author:robert
   date:2018-12-08
   description:	draw line chart
   **/


  Chart.prototype.parseAxisStyle = function () {
    if (this.axis) {
      var style = {};

      if (this.axis.style) {
        style = this.parseStyle(this.axis.style);
        getBorderStack(style, this.stack);
        var xdataPx = this.parseAxisX(style);
        var ydataPx = this.parseAxisY(style);

        if (xdataPx && ydataPx) {
          getGroupLineStack(xdataPx, ydataPx, style["border-left-color"], "solid", style["border-left-width"], this.stack);
        }
      }
    }
  };
  /**
   author:robert
   date:2018-12-08
   description:	redraw chart clear all draw data
   **/


  Chart.prototype.clear = function () {
    var radio = getPixelRatio(this.c);
    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";
    this.canvas.width = this.width * radio;
    this.canvas.height = this.height * radio;
  };
  /**
   author:robert
   date:2018-12-08
   description:	draw chart
   **/


  Chart.prototype.draw = function () {
    var that = this;
    $.each(this.stack, function (idx, val) {
      if (val.type == "line") {
        if (val.style == "solid") {
          drawMoveLine(that.c, val.x1, val.y1, val.x2, val.y2, val.color, val.width);
        } else {
          dashedLine(that.c, val.x1, val.y1, val.x2, val.y2, val.color, val.width);
        }
      }

      if (val.type == "lineGroup") {
        if (val.style == "solid") {
          drawGroupLine(that.c, val.xArr, val.yArr, val.color, val.width);
        } else {
          drawGroupDashedLine(that.c, val.xArr, val.yArr, val.color, val.width);
        }
      } else {
        drawText(that.c, val.text, val.x, val.y, val.color, val.font);
      }
    });
  };
  /**
   author:robert
   date:2018-12-08
   description:	draw blurry line to clear
   **/


  function getPixelRatio(context) {
    var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
  }
  /**
   author:robert
   date:2018-12-08
   description:	px to float, % to relative size
   **/


  function toValue(str, relativeValue) {
    if (typeof str == "number") {
      return str;
    }

    if (str.indexOf("%") != -1) {
      return str.toFloat() / 100 * relativeValue;
    }

    return str.toFloat();
  }
  /**
   author:robert
   date:2018-12-08
   description:	padding to padding-top padding-right padding-bottom padding-left
   **/


  function toFourValue(str, relativeValue) {
    var values = str.split(/\s+/);
    var leftValue;
    var topValue;
    var rightValue;
    var bottomValue;

    if (values.length == 1) {
      leftValue = toValue(values[0], relativeValue);
      return [leftValue, leftValue, leftValue, leftValue];
    } else if (values.length == 2) {
      topValue = toValue(values[0], relativeValue);
      leftValue = toValue(values[1], relativeValue);
      return [topValue, leftValue, topValue, leftValue];
    } else if (values.length == 3) {
      topValue = toValue(values[0], relativeValue);
      bottomValue = toValue(values[2], relativeValue);
      leftValue = toValue(values[1], relativeValue);
      return [topValue, leftValue, bottomValue, leftValue];
    } else if (values.length == 4) {
      topValue = toValue(values[0], relativeValue);
      bottomValue = toValue(values[2], relativeValue);
      leftValue = toValue(values[3], relativeValue);
      rightValue = toValue(values[1], relativeValue);
      return [topValue, rightValue, bottomValue, leftValue];
    }
  }
  /**
   author:robert
   date:2018-12-08
   description:	default value 0
   **/


  function toDefaultValue(val) {
    return val || 0;
  }
  /**
   author:robert
   date:2018-12-08
   description:	set number of layout conver left right top bottom and width height
   **/


  function setDefaultValue(wrapWidth, wrapHeight, style) {
    $.each(["top", "right", "bottom", "left"], function (idx, val) {
      style[val] = toDefaultValue(style[val]);
      style["padding-" + val] = toDefaultValue(style["padding-" + val]);
      style["margin-" + val] = toDefaultValue(style["margin-" + val]);
      style["border-" + val + "-width"] = toDefaultValue(style["border-" + val + "-width"]);
    });
    $.each(["width", "height", "background-position-x", "background-position-y"], function (idx, val) {
      style[val] = toDefaultValue(style[val]);
    }); //如果width存在

    if (!style["width"] && style["left"] && style["right"]) {
      style["width"] = wrapWidth - style["left"] - style["right"];
    }

    if (!style["height"] && style["top"] && style["bottom"]) {
      style["height"] = wrapHeight - style["top"] - style["bottom"];
    }

    if (style["right"] && !style["left"]) {
      style["left"] = wrapWidth - style["right"] + style["width"];
    }

    if (style["bottom"] && !style["top"]) {
      style["top"] = wrapHeight - style["bottom"] + style["height"];
    }
  }
  /**
   author:robert
   date:2018-12-08
   description:	draw line stack
   **/


  function getLineStack(x1, y1, x2, y2, color, style, width, stack) {
    stack.push({
      type: "line",
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      color: color || "#000000",
      style: style || "solid",
      width: width
    });
  }
  /**
   author:robert
   date:2018-12-08
   description:	draw line group stack
   **/


  function getGroupLineStack(xArr, yArr, color, style, width, stack) {
    var x = [],
        y = [];
    var unique = {};

    for (var i = 0; i < xArr.length; i++) {
      if (!unique[xArr[i] + ""]) {
        unique[xArr[i] + ""] = 1;
        x.push(xArr[i]);
        y.push(yArr[i]);
      }
    }

    stack.push({
      type: "lineGroup",
      xArr: x,
      yArr: y,
      color: color || "#000000",
      style: style || "solid",
      width: width
    });
  }
  /**
   author:robert
   date:2018-12-08
   description:	draw border stack
   **/


  function getBorderStack(style, stack) {
    var offset = [];
    var padding = [];
    var margin = [];
    var size = [];
    var border = [];
    $.each(["top", "right", "bottom", "left"], function (idx, val) {
      var sizeHelp = ["height", "width", "height", "width"];
      offset.push(style[val]);
      padding.push(style["padding-" + val]);
      margin.push(style["margin-" + val]);
      size.push(style[sizeHelp[idx]]);
      border.push({
        type: "line",
        color: style["border-" + val + "-color"] || "#000000",
        style: style["border-" + val + "-style"] || "solid",
        width: style["border-" + val + "-width"]
      });
    });
    $.each(border, function (idx, val) {
      var x1 = 0,
          x2 = 0,
          y1 = 0,
          y2 = 0;

      if (idx == 1 || idx == 2) {
        x1 = size[1];
      }

      if (idx == 2 || idx == 3) {
        y1 = size[0];
      }

      if (idx == 0 || idx == 1) {
        x2 = size[1];
      }

      if (idx == 1 || idx == 2) {
        y2 = size[0];
      }

      val.x1 = offset[3] + margin[3] + x1;
      val.x2 = offset[3] + margin[3] + x2;
      val.y1 = offset[0] + margin[0] + y1;
      val.y2 = offset[0] + margin[0] + y2;

      if (val.width) {
        stack.push(val);
      }
    });
  }
  /**
   author:robert
   date:2018-12-08
   description:	draw text stack
   **/


  function getTextStack(text, x, y, color, font, stack, format) {
    stack.push({
      type: "text",
      text: typeof format == "function" ? format(text) : text,
      x: x,
      y: y,
      color: color || "#000000",
      font: font || "12px"
    });
  }
  /**
   author:robert
   date:2018-12-08
   description:	parse one css style to draw params
   **/


  Chart.prototype.parseOneStyle = function (style, styleName, styleValue) {
    var borderH;
    var borderV;

    switch (styleName) {
      case "top":
      case "bottom":
      case "height":
      case "background-position-y":
        style[styleName] = toValue(styleValue, this.height);
        break;

      case "padding":
      case "margin":
        var padding = toFourValue(styleValue, this.width);
        style[styleName + "-top"] = padding[0];
        style[styleName + "-right"] = padding[1];
        style[styleName + "-bottom"] = padding[2];
        style[styleName + "-left"] = padding[3];
        break;

      case "left":
      case "right":
      case "width":
      case "padding-left":
      case "padding-right":
      case "padding-bottom":
      case "padding-top":
      case "margin-left":
      case "margin-right":
      case "margin-bottom":
      case "margin-top":
      case "background-position-x":
        style[styleName] = toValue(styleValue, this.width);
        break;

      case "border":
        styleValue = styleValue.split(/\s+/);
        styleValue[1] = styleValue[1] || "solid";
        styleValue[2] = styleValue[2] || "#000";
        borderH = toValue(styleValue[0], this.width);
        borderV = toValue(styleValue[0], this.height);
        style[styleName + "-left-width"] = borderV;
        style[styleName + "-right-width"] = borderV;
        style[styleName + "-bottom-width"] = borderH;
        style[styleName + "-top-width"] = borderH;
        style[styleName + "-left-style"] = styleValue[1];
        style[styleName + "-right-style"] = styleValue[1];
        style[styleName + "-top-style"] = styleValue[1];
        style[styleName + "-bottom-style"] = styleValue[1];
        style[styleName + "-left-color"] = styleValue[2];
        style[styleName + "-right-color"] = styleValue[2];
        style[styleName + "-top-color"] = styleValue[2];
        style[styleName + "-bottom-color"] = styleValue[2];
        break;

      case "border-right":
      case "border-left":
        styleValue = styleValue.split(/\s+/);
        styleValue[1] = styleValue[1] || "solid";
        styleValue[2] = styleValue[2] || "#000";
        borderH = toValue(styleValue[0], this.width);
        style[styleName + "-width"] = borderH;
        style[styleName + "-style"] = styleValue[1];
        style[styleName + "-color"] = styleValue[2];
        break;

      case "border-top":
      case "border-bottom":
        styleValue = styleValue.split(/\s+/);
        styleValue[1] = styleValue[1] || "solid";
        styleValue[2] = styleValue[2] || "#000";
        borderV = toValue(styleValue[0], this.height);
        style[styleName + "-width"] = borderV;
        style[styleName + "-style"] = styleValue[1];
        style[styleName + "-color"] = styleValue[2];
        break;

      case "background":
        var background = [];
        styleValue = styleValue.match(/(#[0-9a-f]+\s*)|(rgba?\([^\)]+\))|(url?\([^\)]+\))|([0-9a-z-]+\s*)|([0-9a-z-]+\s*)|([0-9a-z-]+\s*)/g);
        var idx = 0;

        if (/(#[0-9a-f]+\s*)|(rgba?\([^\)]+\))/.test(styleValue[0])) {
          style["background-color"] = styleValue[0];
          idx = 1;

          if (/(url?\([^\)]+\))|([0-9a-z-]+\s*)/.test(styleValue[1])) {
            style["background-image"] = styleValue[1];
          }
        } else if (/(url?\([^\)]+\))|([0-9a-z-]+\s*)/.test(styleValue[0])) {
          style["background-image"] = styleValue[0];
        }

        style["background-repeat"] = styleValue[1 + idx];
        style["background-position-x"] = toValue(styleValue[2 + idx], this.width);
        style["background-position-y"] = toValue(styleValue[3 + idx], this.height);
        break;

      default:
        style[styleName] = styleValue;
    }
  };
  /**
   author:robert
   date:2018-12-08
   description:	parse style to draw params
   **/


  Chart.prototype.parseStyle = function (str) {
    var that = this;
    var style = {};

    if (!str) {
      return;
    }

    var item = str.split(";");
    $.each(item, function (idx, val) {
      val = val.trim();

      if (val) {
        var styleItem = val.split(":");

        if (styleItem.length == 2) {
          var styleName = styleItem[0].trim();
          var styleValue = styleItem[1].trim();
          that.parseOneStyle(style, styleName, styleValue);
        }
      }
    });
    setDefaultValue(this.width, this.height, style);
    return style;
  }; // Chart.prototype.addLine  =function(opts){
  // 	opts = RBT.extend({},defaultLineOptions,opts);
  // }
  // Chart.prototype.addPoint  =function(opts){
  // 	opts = RBT.extend({},defaultPointOptions,opts);
  // }

  /**
   author:robert
   date:2013-08-13
   description:	draw line width variable point param0 is context2D laster param is stroke style
   **/


  function drawLine(c, x, y, color, border) {
    var radio = getPixelRatio(c);
    x = x * radio;
    y = y * radio;

    if (!c) {
      throw "画线cavnas 不存在！";
    }

    c.lineTo(x, y);
    c.strokeStyle = color;
    c.lineWidth = border;
    c.stroke();
  }
  /**
   author:robert
   date:2013-08-13
   description:	draw line width variable point param0 is context2D laster param is stroke style
   **/


  function drawMoveLine(c, x0, y0, x1, y1, color, border) {
    if (!c) {
      throw "画线cavnas 不存在！";
    }

    var radio = getPixelRatio(c);
    c.beginPath();
    c.lineCap = "round";
    c.lineJoin = "round";
    x0 = x0 * radio;
    y0 = y0 * radio; // if(x0%2){
    // 	x0+=.5;
    // }
    // if(y0%2){
    // 	y0+=.5;
    // }

    c.moveTo(x0, y0);
    drawLine(c, x1, y1, color, border);
  }
  /**
   author:robert
   date:2013-08-13
   description:	draw group line
   **/


  function drawGroupLine(c, xArr, yArr, color, border) {
    if (!c) {
      throw "画线cavnas 不存在！";
    }

    var radio = getPixelRatio(c);
    c.beginPath();
    c.lineCap = "round";
    c.lineJoin = "round";
    var x, y;

    for (var i = 0; i < xArr.length; i++) {
      yArr[i] = yArr[i] || 0;
      x = xArr[i] * radio;
      y = yArr[i] * radio;

      if (i == 0) {
        c.moveTo(x, y);
      } else {
        c.lineTo(x, y);
      }
    }

    c.strokeStyle = color;
    c.lineWidth = border;
    c.stroke();
    c.closePath();
  }
  /**
   author:robert
   date:2013-08-13
   description:	draw group line
   **/


  function drawGroupDashedLine(c, xArr, yArr, color, border) {
    for (var i = 0; i < xArr.length; i += 2) {
      yArr[i] = yArr[i] || 0;
      dashedLine(c, xArr[i], yArr[i], xArr[i + 1], yArr[i + 1], color, border);
    }

    if (xArr.length < i) {
      dashedLine(c, xArr[i - 2], yArr[i - 2], xArr[i - 1], yArr[i - 1], color, border);
    }
  }
  /**
   author:robert
   date:2014-01-16
   description:	dash line dot to dot  dashArray is length of solid line and dash line;
   **/


  function dashedLine(c, x, y, x2, y2, color, border, dashArray) {
    if (!dashArray) {
      dashArray = [10, 5];
    }

    var dx = x2 - x,
        dy = y2 - y;
    var distRemaining = Math.sqrt(dx * dx + dy * dy);
    var dashLen = dashArray[0] + dashArray[1];
    var step = Math.floor(distRemaining / dashLen);
    var dashArraySlop = dashArray[0] / dashLen;
    var xStep = dx / step;
    var yStep = dy / step;
    var dashIndex = 0,
        draw = true;
    var x0, y0;

    for (var i = 0; i < step; i++) {
      x0 = x + i * xStep;
      y0 = y + i * yStep;
      drawMoveLine(c, x0, y0, x0 + xStep * dashArraySlop, y0 + yStep * dashArraySlop, color, border);
    }
  }
  /**
   author:robert
   date:2014-01-16
   description:	fill dot
   **/


  function drawDot() {
    var argLen = arguments.length;
    var c = arguments[0];

    if (!c) {
      throw "画点 canvas对象不存在！";
    }

    if (argLen >= 5) {
      c.beginPath(); //	console.log(arguments[argLen-1])

      for (var i = 2; i < arguments.length - 1; i += 2) {
        c.arc(arguments[i - 1], arguments[i], arguments[argLen - 2], 0, Math.PI * 2, true);
      }

      c.fillStyle = arguments[argLen - 1];
      c.fill();
    } else {
      throw "画点 参数不对！";
    }
  }
  /**
   author:robert
   date:2014-01-16
   description:	fill text
   **/


  function drawText(c, t, x, y, color, font) {
    var radio = getPixelRatio(c);
    x = x * radio;
    y = y * radio;

    if (!c) {
      return;
    }

    c.beginPath();
    c.fillStyle = color;

    if (font) {
      c.font = font;
    }

    c.fillText(t, x, y);
  }
  /**
   author:robert
   date:2014-01-16
   description:	fill picture
   **/


  function drawPicture(c, src, x, y, _load) {
    if (!c) {
      throw "画图 canvas对象不存在！";
    }

    var img = new Image();
    img.src = src;

    if (!_load) {
      img.onload = function () {
        c.beginPath();
        c.drawImage(img, x, y);
      };
    } else {
      c.beginPath();
      c.drawImage(img, x, y);
    }
  }
  /**
   author:robert
   date:2018-12-07
   description:	use RBT.dom prototype function to do chart
   **/


  RBT.dom.fn.chart = function (opts, callback) {
    if (!this[0]) {
      return null;
    }

    if ($(this).data("init-chart")) {
      return $(this).data("init-chart");
    }

    var c = $(this).find("canvas")[0];
    var chart = new Chart(opts, c, this[0]);
    $(this).data("init-chart", chart);
    return chart;
  };
})(window.RBT.dom, RBT.resizeStack);

;
/*
	AUTHOR : robert
	GLOBAL : 全局模块 RBT 对外接口 dom
	RETURN : RBT.dom的实例
	DEPENDENCE : RBT.dom ,RBT.each
*/

;

(function ($) {
  $(window).on("load", function () {
    var timing = window.performance.timing;
    var entries = window.performance.getEntries();
    var readyStart = timing.fetchStart - timing.navigationStart;
    var redirectTime = timing.redirectEnd - timing.redirectStart;
    var appcacheTime = timing.domainLookupStart - timing.fetchStart;
    var unloadEventTime = timing.unloadEventEnd - timing.unloadEventStart;
    var lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
    var connectTime = timing.connectEnd - timing.domainLookupEnd;
    var requestTime = timing.responseEnd - timing.connectEnd;
    var initDomTreeTime = timing.domInteractive - timing.responseEnd;
    var initContentLoad = timing.domInteractive - timing.navigationStart;
    var domReadyTime = timing.domComplete - timing.domInteractive;
    var whitePaper = timing.domComplete - timing.navigationStart;
    var loadEventEnd = timing.loadEventEnd || new Date().getTime();
    var loadEventTime = loadEventEnd - timing.loadEventStart; //过早获取时,domComplete有时会是0

    var loadTime = loadEventEnd - timing.navigationStart; //过早获取时,loadEventEnd有时会是0

    var transfer = 0;
    var jsTransfer = 0;
    var cssTransfer = 0;
    var imgTransfer = 0;
    var htmlTransfer = 0;
    $.each(entries, function (idx, val) {
      if (val.entryType == "navigation") {
        htmlTransfer += val.transferSize;
      }

      if (val.entryType == "resource" && /\.css$/.test(val.name)) {
        cssTransfer += val.transferSize;
      }

      if (val.entryType == "resource" && /\.js$/.test(val.name)) {
        jsTransfer += val.transferSize;
      }

      if (val.entryType == "resource" && /\.(png|gif|svg|jpg|webp)$/.test(val.name)) {
        imgTransfer += val.transferSize;
      }

      if (val.transferSize) {
        transfer += val.transferSize;
      }
    });
    RBT.performance = {
      readyStart: readyStart,
      //浏览器反应的时间
      redirectTime: redirectTime,
      appcacheTime: appcacheTime,
      unloadEventTime: unloadEventTime,
      lookupDomainTime: lookupDomainTime,
      connectTime: connectTime,
      requestTime: requestTime,
      initDomTreeTime: initDomTreeTime,
      domReadyTime: domReadyTime,
      loadEventTime: loadEventTime,
      initContentLoad: initContentLoad,
      whitePaper: whitePaper,
      loadTime: loadTime,
      requestNum: entries.length,
      transfer: [transfer, htmlTransfer, imgTransfer, cssTransfer, jsTransfer]
    };
    console.log('准备新页面时间耗时: ' + readyStart);
    console.log('redirect 重定向耗时: ' + redirectTime);
    console.log('Appcache 耗时: ' + appcacheTime);
    console.log('unload 前文档耗时: ' + unloadEventTime);
    console.log('DNS 查询耗时: ' + lookupDomainTime);
    console.log('TCP连接耗时: ' + connectTime);
    console.log('request请求耗时: ' + requestTime);
    console.log('请求完毕至DOM加载: ' + initDomTreeTime);
    console.log('解释dom树耗时: ' + domReadyTime);
    console.log('load事件耗时: ' + loadEventTime);
    console.log('contentLoad事件时间: ' + initContentLoad);
    console.log('用户空白时间: ' + whitePaper);
    console.log('从开始至load总耗时: ' + loadTime);
    $("body").trigger("performance");
  });
})(RBT.dom);