require("../lib/global/global.localRequire");
var convertParams = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/convertParams.js");

test("parseCallbackEndArg 测试可变参数自动匹配对象", () => {

  var a = convertParams("path", "txt", true, () => { return ("filter") }, () => { return "callback" });
  expect(a.filter()).toBe("filter");
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBe("txt");
  expect(a.deep).toBe(true);

  a = convertParams("path", true, () => { return ("filter") }, () => { return ("callback") })
  expect(a.filter()).toBe("filter");
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBe(true);

  a = convertParams("path", () => { return ("filter") }, () => { return ("callback") })
  expect(a.filter()).toBe("filter");
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBeUndefined();

  a = convertParams("path", "txt", true, () => { return ("callback") })
  expect(a.filter).toBeUndefined();
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBe("txt");
  expect(a.deep).toBe(true);

  a = convertParams("path", true, () => { return ("callback") })
  expect(a.filter).toBeUndefined();
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBe(true);

  a = convertParams("path", () => { return ("callback") })
  expect(a.filter).toBeUndefined();
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBeUndefined();

  a = convertParams("path", () => { return ("filter") }, null, () => { return ("callback") })
  expect(a.filter()).toBe("filter");
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBeUndefined();

  a = convertParams("path", null, () => { return ("filter") }, null, () => { return ("callback") })
  expect(a.filter()).toBe("filter");
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBeUndefined();

  a = convertParams("path", null, null, () => { return ("filter") }, () => { return ("callback") })
  expect(a.filter()).toBe("filter");
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBeUndefined();

  a = convertParams("path", null, () => { return ("filter") }, () => { return ("callback") }, null)
  expect(a.filter()).toBe("filter");
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBeUndefined();

  a = convertParams("path", null, null, () => { return ("callback") })
  expect(a.filter).toBeUndefined();
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBeUndefined();

  a = convertParams("path", null, null, null, () => { return ("callback") })
  expect(a.filter).toBeUndefined();
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBeUndefined();

  a = convertParams("path", "txt", null, () => { return ("callback") })
  expect(a.filter).toBeUndefined();
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBe("txt");
  expect(a.deep).toBeUndefined();

  a = convertParams("path", true, null, () => { return ("callback") })
  expect(a.filter).toBeUndefined();
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBe(true);

  a = convertParams("path", () => { return ("filter") }, null, null, () => { return ("callback") })
  expect(a.filter()).toBe("filter");
  expect(a.callback()).toBe("callback");
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBeUndefined();

  a = convertParams("path")
  expect(a.filter).toBeUndefined();
  expect(a.callback).toBeUndefined();
  expect(a.fileType).toBeUndefined();
  expect(a.deep).toBeUndefined();

});