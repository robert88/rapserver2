module.exports = {
    fieldset: [{
      name: "type",
      label: "类型",
      check: "required",
      id: "cacheType",
      type: "select",
      options:[{value:"dir",name:"目录"},{value:"file",name:"文件"}],
      msg: [{ name: "required", value: "必填项" }]
    }, {
      name: "path",
      label: "根目录",
      check: "required",
      id: "cachePaths",
      type: "textarea",
      msg: [{ name: "required", value: "必填项" }]
    }, {
      type: "btn",
      label: "提交"
    }]
  }