;(function(){
  const a = 1;
  let b = [2,3];
  
  async function test(... arg) {
    return await setText()
  }
  
  async function setText() {
    b.forEach(item=>{
      console.log(item);
    })
    return 2
  }
  
  test(2,3)
})()
