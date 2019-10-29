const fs = require("fs")
const webpack = require("webpack")
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
//vue cli webpack config
var webpackoptions = {
  context: __dirname,
  devtool: "cheap-moudle-hidden-source",
  entry: {
  pageA: "./testSplitChunk/pageA", // 引用utility1.js  utility2.js
  pageB: "./testSplitChunk/pageB", // 引用utility2.js  utility3.js
  pageC: "./testSplitChunk/pageC"  // 引用utility2.js  utility3.js
},
mode: 'development',
output: {
  filename: "[name].js",
  path: "d:\\yinming\\code\\rapserver2-master\\client\\admin\\testSplitChunk\\dist",
},
module:{
  rules:[{
    test: /\.m?jsx?$/,
    use: [
      { loader: "babel-loader" }
    ]
  }]
},

optimization: {
  runtimeChunk: {
    name: "webpack_require"
  },
  splitChunks: {
    cacheGroups: {
      commons: {
        chunks: "initial",
        minChunks: 2,
        // name:"common",
        maxInitialRequests: 5, // The default limit is too small to showcase the effect
        minSize: 0 // This is example is too small to create commons chunks
      }
    }
  }
},
plugins:[
  new CleanWebpackPlugin()
]}	


var compiler = webpack(webpackoptions);
compiler.run(); 
module.exports = webpackoptions

