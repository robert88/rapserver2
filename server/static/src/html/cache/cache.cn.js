module.exports = {
    fieldset: [{
      name: "type",
      label: "类型",
      check: "required",
      id: "cacheType",
      type: "select",
      options:[{value:"dir",name:"目录"},{value:"file",name:"文件"},{value:"action",name:"action"}],
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
    }],
    taskList:[{
      className:"restart",
      name:"重启服务"
    },
    {
      className:"rapserverGit",
      name:"rapserver git"
    },
    {
      className:"rapserverBuild",
      name:"rapserver 静态编译"
    },
    {
      className:"creditGit",
      name:"credit git"
    },
    {
      className:"creditBuild",
      name:"credit 静态编译"
    }
]
  }