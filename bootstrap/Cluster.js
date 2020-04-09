const cluster = require('cluster');


const http = require('http');
const numCPUs = require('os').cpus().length;

exports = module.exports = function(workerRunner) {
  if (cluster.isMaster) {
    cluster.on("exit", (worker, code, signal) => {
      //restart code process.exit(200)
      if (code == 200) {
        cluster.fork().send("restart");
      }
    });


    return cluster;
  } else {
    process.on("message", msg => {
      switch (msg) {
        case "start":
          workerRunner();
          break;
        case "restart":
          workerRunner("restart");
          break;
      }
    })

  }
}