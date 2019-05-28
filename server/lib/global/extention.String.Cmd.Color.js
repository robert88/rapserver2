/*
cmd中的文字显示是固定排列的
 \u001b[33m + str + \u001b[39m
*/

var styles = {};
module['exports'] = styles;

var codes = {
  reset: [0, 0],
  //
  // bold: [1, 22],
  // dim: [2, 22],
  // italic: [3, 23]
  // underline: [4, 24],
  // inverse: [7, 27],
  // hidden: [8, 28],
  // strikethrough: [9, 29],

  // black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  blue: [34, 39],
  yellow: [33, 39],
  
  error: [31, 39],
  success:[32, 39],
  info:[34, 39],
  warn: [33, 39],

  // magenta: [35, 39],
  // cyan: [36, 39],
  // white: [37, 39],
  // gray: [90, 39],
  // grey: [90, 39],

  // bgBlack: [40, 49],
  // bgRed: [41, 49],
  // bgGreen: [42, 49],
  // bgYellow: [43, 49],
  // bgBlue: [44, 49],
  // bgMagenta: [45, 49],
  // bgCyan: [46, 49],
  // bgWhite: [47, 49],

  // legacy styles for colors pre v1.0.0
  // blackBG: [40, 49],
  // redBG: [41, 49],
  // greenBG: [42, 49],
  // yellowBG: [43, 49],
  // blueBG: [44, 49],
  // magentaBG: [45, 49],
  // cyanBG: [46, 49],
  // whiteBG: [47, 49]

};

Object.keys(codes).forEach(function (key) {
  var val = codes[key];
  var style = styles[key] = [];
  style.open = '\u001b[' + val[0] + 'm';
  style.close = '\u001b[' + val[1] + 'm';
  String.prototype.__defineGetter__(key, function () {
   return  style.open + this + style.close;
  });

});
