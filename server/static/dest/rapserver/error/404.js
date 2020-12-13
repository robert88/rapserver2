;
;

(function ($, parseTeample, socketSend) {
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
  $(document).on("mousemove", function (e) {
    var x = e.pageX;
    var y = e.pageY;
    var rightV = getVector(10, x, y, rightCenter);
    var leftV = getVector(10, x, y, leftCenter);
    $right.css("transform", "translate(" + rightV.x + "px," + rightV.y + "px)");
    $left.css("transform", "translate(" + leftV.x + "px," + leftV.y + "px)");
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
})(RBT.dom, RBT.parseTeample, RBT.socketSend);