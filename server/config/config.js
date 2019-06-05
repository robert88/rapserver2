(function anonymous(_callback) {
  "use strict";
  var _context;
  var _x = this._x;
  var _results = new Array(1);
  var _checkDone = () => {
    for (var i = 0; i < _results.length; i++) {
      var item = _results[i];
      if (item === undefined) return false;
      if (item.result !== undefined) {
        _callback(null, item.result);
        return true;
      }
      if (item.error) {
        _callback(item.error);
        return true;
      }
    }
    return false;
  }
  var _fn0 = _x[0];
  _fn0((_err0, _result0) => {
    if (_err0) {
        
        0 < _results.length && ((_results.length = 1), (_results[0] = { error: _err0 }));

      if (_checkDone()) {

      } else {
        _callback();
      }
      ;
    } else {
      if (0 < _results.length && (_result0 !== undefined && (_results.length = 1), (_results[0] = { result: _result0 }), _checkDone())) {} else {
        _callback();
      }
    }
  });

})