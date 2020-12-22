;
;

(function ($, parseTeample, socketSend) {
  document.onselectstart = function () {
    return false;
  };

  var cw = $("#beastainer").width();
  var ch = $("#beastainer").height();
  var cavans = $("#draw404")[0];
  cavans.width = cw - 40;
  cavans.height = ch - 40;
  var sx = $("#draw404").offset().left;
  var sy = $("#draw404").offset().top;
  var ctx = cavans.getContext("2d");
  var $right = $("#beast404re");
  var $left = $("#beast404le");
  var rightCenter = {
    x: $right.offset().left,
    y: $right.offset().top
  };
  var leftCenter = {
    x: $left.offset().left,
    y: $left.offset().top
  };
  var dx,
      dy,
      down = false;
  $(document).on("mousedown", function (e) {
    dx = e.pageX;
    dy = e.pageY;
    down = true;
  });
  var px, py;
  $(document).on("mousemove", function (e) {
    var x = e.pageX;
    var y = e.pageY;
    var rightV = getVector(5, x, y, rightCenter);
    var leftV = getVector(5, x, y, leftCenter);
    $right.css("transform", "translate(" + rightV.x + "px," + rightV.y + "px)");
    $left.css("transform", "translate(" + leftV.x + "px," + leftV.y + "px)");

    if (down && px != null) {
      drawMoveLine(ctx, px - sx, py - sy, x - sx, y - sy, "#6cae00", 2);
    }

    px = x;
    py = y;
  });
  $(document).on("mouseup", function (e) {
    down = false;
  });

  function getVector(r, x, y, v) {
    var x0 = x - v.x;
    var y0 = y - v.y;
    var l = Math.sqrt(r * r / (x0 * x0 + y0 * y0));
    return {
      x: l * x0,
      y: l * y0
    };
  }
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
    y0 = y0 * radio;
    c.moveTo(x0, y0);
    drawLine(c, x1, y1, color, border);
  }
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
})(RBT.dom, RBT.parseTeample, RBT.socketSend);