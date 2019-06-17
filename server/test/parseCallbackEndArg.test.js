require("../lib/global/global.localRequire");
var parseCallbackEndArg = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/parseCallbackEndArg.js");

test("parseCallbackEndArg 测试可变参数自动匹配对象", () => {

  function test() {
    return parseCallbackEndArg(Array.prototype.slice.call(arguments, 0), "path, fileType,good, deep, callback", "number,boolean,function");
  }
  //1
  {
    let { path, fileType, good, deep, callback } = test("1");
    expect(path).toBe("1");
    expect(fileType).toBeUndefined();
    expect(good).toBeUndefined();
    expect(deep).toBeUndefined();
    expect(callback).toBeUndefined();
  }
  //1
  {
    let { path, fileType, good, deep, callback } = test(3);
    expect(path).toBeUndefined();
    expect(fileType).toBeUndefined();
    expect(good).toBe(3);
    expect(deep).toBeUndefined();
    expect(callback).toBeUndefined();
  }
  //1
  {
    let { path, fileType, good, deep, callback } = test(true);
    expect(path).toBeUndefined();
    expect(fileType).toBeUndefined();
    expect(good).toBeUndefined();
    expect(deep).toBe(true);
    expect(callback).toBeUndefined();
  }
  //1
  {
    let { path, fileType, good, deep, callback } = test(function() {});
    expect(path).toBeUndefined();
    expect(fileType).toBeUndefined();
    expect(good).toBeUndefined();
    expect(deep).toBeUndefined();
    expect(typeof callback).toBe("function");
  }
  //2
  {
    let { path, fileType, good, deep, callback } = test("1", "2");
    expect(path).toBe("1");
    expect(fileType).toBe("2");
    expect(good).toBeUndefined();
    expect(deep).toBeUndefined();
    expect(callback).toBeUndefined();
  }

  //2
  {
    let { path, fileType, good, deep, callback } = test("1", 3);
    expect(path).toBe("1");
    expect(fileType).toBeUndefined();
    expect(good).toBe(3);
    expect(deep).toBeUndefined();
    expect(callback).toBeUndefined();
  }

  //2
  {
    let { path, fileType, good, deep, callback } = test("1", true);
    expect(path).toBe("1");
    expect(fileType).toBeUndefined();
    expect(good).toBeUndefined();
    expect(deep).toBe(true);
    expect(callback).toBeUndefined();
  }

  //2
  {
    let { path, fileType, good, deep, callback } = test("1", function() {});
    expect(path).toBe("1");
    expect(fileType).toBeUndefined();
    expect(good).toBeUndefined();
    expect(deep).toBeUndefined();
    expect(typeof callback).toBe("function");
  }

  //3
  {
    let { path, fileType, good, deep, callback } = test("1", "2", 3);
    expect(path).toBe("1");
    expect(fileType).toBe("2");
    expect(good).toBe(3);
    expect(deep).toBeUndefined();
    expect(callback).toBeUndefined();
  }

  //3
  {
    let { path, fileType, good, deep, callback } = test("1", "2", true);
    expect(path).toBe("1");
    expect(fileType).toBe("2");
    expect(good).toBeUndefined();
    expect(deep).toBe(true);
    expect(callback).toBeUndefined();
  }
  //3
  {
    let { path, fileType, good, deep, callback } = test("1", "2", function() {});
    expect(path).toBe("1");
    expect(fileType).toBe("2");
    expect(good).toBeUndefined();
    expect(deep).toBeUndefined();
    expect(typeof callback).toBe("function");
  }
  //4
  {
    let { path, fileType, good, deep, callback } = test("1", "2", 3, function() {});
    expect(path).toBe("1");
    expect(fileType).toBe("2");
    expect(good).toBe(3);
    expect(deep).toBeUndefined();
    expect(typeof callback).toBe("function");
  }
  //4
  {
    let { path, fileType, good, deep, callback } = test("1", "2", 3, true);
    expect(path).toBe("1");
    expect(fileType).toBe("2");
    expect(good).toBe(3);
    expect(deep).toBe(true);
    expect(callback).toBeUndefined();
  }
  //5
  {
    let { path, fileType, good, deep, callback } = test("1", "2", 3, true, function() {});
    expect(path).toBe("1");
    expect(fileType).toBe("2");
    expect(good).toBe(3);
    expect(deep).toBe(true);
    expect(typeof callback).toBe("function");
  }

});