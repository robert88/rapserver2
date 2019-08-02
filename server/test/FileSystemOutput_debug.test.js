require("../lib/global/global.localRequire");

const FileSystemOutput = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemOutput.js");

var output = new FileSystemOutput(null, true);

var input = output.input;

var allDir = localRequire("@/server/test/output", true);

output.removeSync(allDir);

// // //write
test('FileSystemOutput debug write', (done) => {
  var src = allDir + "/testWrite/a.txt"

  output.writeSync(src, "hello world1!");
  var data = input.readDataSync(src);
  expect(data).toBe("hello world1!");

  output.writeSync(src, "append!", true);
  data = input.readDataSync(src);
  expect(data).toBe("hello world1!append!");

  output.write(src, "hello world2!").then(() => {
    var data = input.readDataSync(src);
    expect(data).toBe("hello world2!");
    output.write(src, "append!", true).then(() => {
      var data = input.readDataSync(src);
      expect(data).toBe("hello world2!append!");

      output.removeSync(src);
      expect(input.existsSync(src)).toBe(false);
      done();
    });
  });

})

// //copy
test('FileSystemOutput debug copy', (done) => {
  var src = allDir+"/testcopy/a.txt";
  var dir = allDir+"/testcopy2/a.txt"
  var data, srcModify, dirModify

  output.removeSync(src)
  output.writeSync(src, "hello world1!");
  output.copySync(src, dir);
  data = input.readDataSync(dir);
  expect(data).toBe("hello world1!");
  srcModify = input.getModifySync(src);
  dirModify = input.getModifySync(dir);
  expect(srcModify).toBe(dirModify);

  //不会覆盖
  output.writeSync(src, "hello world2!");
  output.copySync(src, dir, false);
  dirModify = input.getModifySync(dir);
  expect(srcModify).toBe(dirModify);
  data = input.readDataSync(dir);
  expect(data).toBe("hello world1!");


  output.writeSync(src, "hello world3!");
  output.copy(src, dir).then(() => {
    var data = input.readDataSync(dir);
    var srcModify = input.getModifySync(src);
    var dirModify = input.getModifySync(dir);
    expect(data).toBe("hello world3!");
    expect(srcModify).toBe(dirModify);
    //不会覆盖
    output.writeSync(src, "hello world4!");
    output.copy(src, dir, false).then(() => {
      dirModify = input.getModifySync(dir);
      expect(srcModify).toBe(dirModify);
      data = input.readDataSync(dir);
      expect(data).toBe("hello world3!");
      done();
    })

  });



})


// // //remove
test('FileSystemOutput debug remove', (done) => {
  var src1 =allDir+"/testremove/a1.txt"
  var src2 = allDir+"/testremove/a2.txt"
  var src3 = allDir+"/testremove/a3.txt"
  var dir = allDir+"/testremove"


  output.writeSync(src1, "hello world1!");
  output.writeSync(src2, "hello world1!");
  output.writeSync(src3, "hello world1!");

  expect(input.existsSync(src1)).toBe(true);
  output.removeSync(src1);
  expect(input.existsSync(src1)).toBe(false);

  output.removeSync(dir);

  expect(input.existsSync(src2)).toBe(false);
  expect(input.existsSync(dir)).toBe(false);


  output.writeSync(src1, "hello world1!");
  output.writeSync(src2, "hello world1!");
  output.writeSync(src3, "hello world1!");
  expect(input.existsSync(src1)).toBe(true);

  output.remove(src1).then(() => {
    expect(input.existsSync(src1)).toBe(false);
    output.remove(dir).then(() => {
      done()
    });
  });

})

// //cut

test('FileSystemOutput debug cut', (done) => {
  var src = allDir+"/testcut/a1.txt"
  var dir = allDir+"/testcut2/a1.txt"

  try {
    output.cutSync(src, dir);
  } catch (error) {
    expect(error.message).toBe(true);
  }

  output.writeSync(src, "hello world1!");

  expect(input.existsSync(src)).toBe(true);
  expect(input.existsSync(dir)).toBe(false);

  output.cutSync(src, dir);

  expect(input.existsSync(src)).toBe(false);
  expect(input.existsSync(dir)).toBe(true);

  var data = input.readDataSync(dir);
  expect(data).toBe("hello world1!");

  //不覆盖
  output.writeSync(src, "hello world2!");

  output.cutSync(src, dir, false);
  expect(input.existsSync(src)).toBe(true);
  expect(input.existsSync(dir)).toBe(true);
  data = input.readDataSync(dir);
  expect(data).toBe("hello world1!");

  //异步
  output.cut(src, dir).then(() => {
    expect(input.existsSync(src)).toBe(false);
    expect(input.existsSync(dir)).toBe(true);
    data = input.readDataSync(dir);
    expect(data).toBe("hello world2!");

    //异步不覆盖
    output.writeSync(src, "hello world3!");
    output.cut(src, dir, false).then(() => {
      expect(input.existsSync(src)).toBe(true);
      expect(input.existsSync(dir)).toBe(true);
      data = input.readDataSync(dir);
      expect(data).toBe("hello world2!");
      done();
    });


  });


})

//rename

test('FileSystemOutput debug rename', (done) => {

  var src = allDir+"/testrename/a1.txt"
  var dir = allDir+"/testrename/a2.txt"
  var srcFlag, dirFlag;
  var dirName = "a2.txt"
  //不存在源文件

  output.renameSync(src, dirName);

  output.writeSync(src, "hello world1!");

  srcFlag = input.existsSync(src);
  dirFlag = input.existsSync(dir)

  expect(srcFlag).toBe(true);
  expect(dirFlag).toBe(false);

  output.renameSync(src, dirName);
  srcFlag = input.existsSync(src);
  dirFlag = input.existsSync(dir)
  expect(srcFlag).toBe(false);
  expect(dirFlag).toBe(true);

  var data = input.readDataSync(dir);
  expect(data).toBe("hello world1!");


  output.writeSync(src, "hello world2!");

  srcFlag = input.existsSync(src);
  dirFlag = input.existsSync(dir)

  expect(srcFlag).toBe(true);
  expect(dirFlag).toBe(true);

  output.renameSync(src, dirName);

  srcFlag = input.existsSync(src);
  dirFlag = input.existsSync(dir)

  expect(srcFlag).toBe(true);
  expect(dirFlag).toBe(true);

  var data = input.readDataSync(dir);
  expect(data).toBe("hello world1!");

  //异步
  output.removeSync(dir);

  srcFlag = input.existsSync(src);
  dirFlag = input.existsSync(dir)

  expect(srcFlag).toBe(true);
  expect(dirFlag).toBe(false);

  output.writeSync(src, "hello world3!");
  output.rename(src, dirName).then(() => {
    srcFlag = input.existsSync(src);
    dirFlag = input.existsSync(dir)

    expect(srcFlag).toBe(false);
    expect(dirFlag).toBe(true);

    var data = input.readDataSync(dir);
    expect(data).toBe("hello world3!");

    output.writeSync(src, "hello world4!");
    srcFlag = input.existsSync(src);
    dirFlag = input.existsSync(dir)

    expect(srcFlag).toBe(true);
    expect(dirFlag).toBe(true);

    output.rename(src, dirName).then(() => {

      srcFlag = input.existsSync(src);
      dirFlag = input.existsSync(dir)

      expect(srcFlag).toBe(true);
      expect(dirFlag).toBe(true);

      var data = input.readDataSync(dir);
      expect(data).toBe("hello world3!");

      done();
    });
  });

})