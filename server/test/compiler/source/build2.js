const a = 1;
let b = [2,3];

async function test() {
  return await setText()
}

async function setText() {
  b.forEach(item=>{
    console.log(item);
  })
  return 2
}