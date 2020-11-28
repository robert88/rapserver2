global.rap = global.rap || {};

/**
 *
 *节流，减少触发次数
 * a_b_c_d_e_f_g
 * 1____1____1____1____1
 *触发a、c、d、f、g
 * callback需要执行参数解析
 * */
var debounce = {};
rap.debounce = function(callback, time, uuid, params) {

  if (!uuid) {
    console.log("请提供唯一的标识");
  }

  time = time || 10000;

  let control = debounce[uuid] || [];


  //锁定10s
  if (control.length == 0) {


    callback([params], uuid);

    //增加了一个长度
    control.push(null);

    //control赋值给debounce之后push是同步操作
    debounce[uuid] = control;

    setTimeout(function() {

      if (debounce[uuid].length > 1) {
        callback(debounce[uuid].slice(1), uuid);
      }
      //清除内存
      debounce[uuid] = null;
      delete debounce[uuid];

    }, time);

  } else {
    //累计参数
    control.push(params);
  }
  //清除内存
  control = null;

};