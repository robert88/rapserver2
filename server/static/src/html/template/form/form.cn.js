module.exports = {
  fieldset: [{
    name: "rootId",
    label: "路径id",
    check: "required",
    type: "text",
    msg: [{ name: "required", value: "必填项" }]
  }, {
    name: "path",
    label: "物理路径",
    check: "required",
    type: "text",
    msg: [{ name: "required", value: "必填项" }]
  }, {
    type: "btn",
    label: "提交"
  }]
}