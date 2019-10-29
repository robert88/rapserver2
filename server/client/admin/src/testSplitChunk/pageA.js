import(/* webpackChunkName: "my-chunk-name" */ "./unit1").then(a=>{
    console.log("page unit1 dy")
})
import(/* webpackChunkName: "my-chunk-name1" */ "./unit2").then(a=>{
    console.log("page unit1 dy")
})
// import b from "./unit2"
console.log("pageA")