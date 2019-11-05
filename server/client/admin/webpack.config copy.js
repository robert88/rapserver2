const merge = require("deepmerge")

const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PreloadPluginPreload = require("preload-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require("webpack")
let CleanWebpackPlugin = require("clean-webpack-plugin");
/**css */
var cssLoaderConfig = [
  { loader: "vue-style-loader", options: { shadowMode: false, sourceMap: false } },
  { loader: "css-loader"}
]

function getCSSconfigByName(name, nameloader) {
  var loader = cssLoaderConfig.slice(0, 3).concat(nameloader);
  return [{
    resourceQuery: /module/,
    use: merge([], loader)
  }, {
    resourceQuery: /\?vue/,
    use: merge([], loader)
  }, {
    test: /\.module\.\w+$/,
    use: merge([], loader)
  }, {
    use: merge([], loader)
  }]
}
var cssConfig = getCSSconfigByName("css", []);
/**post */  // ,},
var postConfig = getCSSconfigByName("postcss", [{ loader: "postcss-loader", options: { sourceMap: false } }]);
/**sass */
var sassConfig = getCSSconfigByName("sass", [{ loader: "sass-loader", options: { sourceMap: false } }]);
/**scss */
var scssConfig = getCSSconfigByName("scss", [{ loader: "scss-loader", options: { sourceMap: false } }]);
/**less */
var lessConfig = getCSSconfigByName("less", [{ loader: "less-loader", options: { sourceMap: false } }]);
/**stylus */
var stylusConfig = getCSSconfigByName("stylus", [{ loader: "stylus-loader", options: { sourceMap: false } }]);
/*file*/
var urlLoaderConfig = [
  { loader: "url-loader", options: { limit: 4096, fallback: { loader: "file-loader", options: { name: "img/[name].[hash:8].[ext]" } } } }
]


//vue cli webpack config
var webpackoptions = {
  context: __dirname,
  // devtool: "cheap-moudle-hidden-source-map",
  entry: {
    app: [
      "./src/entry/main.js"
    ]
  },
  mode: "development",
  module: {
    //我们对类似jq这类依赖库，一般会认为不会引用其他的包(特殊除外,自行判断)。所以，对于这类不引用其他的包的库，我们在打包的时候就没有必要去解析，这样能够增加打包速率
    //但是还是会生成chuck
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
    {
      test: /\.vue$/,
      use: [
        { loader: "vue-loader" }
      ]
    },
    // {
    //   test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
    //   use: merge([], urlLoaderConfig)
    // },
    // {
    //   test: /\.(svg)(\?.*)?$/,
    //   use: [{ loader: "file-loader", options: { name: "img/[name].[hash:8].[ext]" } }]
    // },
    // {
    //   test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
    //   use: merge([], urlLoaderConfig)
    // },
    // {
    //   test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    //   use: merge([], urlLoaderConfig)
    // },
    // {
    //   test: /\.pug$/,
    //   oneOf: [{ resourceQuery: /vue/, use: [{ loader: "pug-plain-loader" }] }, { user: [{ loader: "raw-loader" }, { loader: "pug-plain-loader" }] }]
    // },
    // {
    //   test: /\.css$/,
    //   // __ruleNames: ["css"],
    //   oneOf: merge([], cssConfig)
    // },
    // {
    //   test: /\.p(ost)?css$/,
    //   // __ruleNames: ["postcss"],
    //   oneOf: merge([], postConfig)
    // },
    // {
    //   test: /\.scss$/,
    //   // __ruleNames: ["scss"],
    //   oneOf: merge([], scssConfig, [{}])
    // },
    // {
    //   test: /\.sass$/,
    //   // __ruleNames: ["sass"],
    //   oneOf: merge([], sassConfig, [{}])
    // },
    // {
    //   test: /\.less$/,
    //   // __ruleNames: ["less"],
    //   oneOf: merge([], sassConfig, [{}])
    // },
    {
      test: /\.styl(us)?$/,
      oneOf: merge([], stylusConfig)
    },
    {
      test: /\.m?jsx?$/,
      use: [
        { loader: "babel-loader" }
      ]
    },
    
    // {
    //   test: /\.(vue|(j|t)sx?)$/,
    //   use: [{
    //     loader: "eslint-loader",
    //     options: {
    //       cache: true,
    //       cacheIdentifier: "6d919dbb",
    //       emitError: false,
    //       emitWarning: true,
    //       extensions: [".js", ".jsx", ".vue"],
    //       eslintPath: "d:\yinming\code\rapserver2-master\client\accout2\node_modules\eslint"
    //     }
    //   }]
    // }
]
  },
  node: {
    child_process: "empty",
    dgram: "empty",
    fs: "empty",
    net: "empty",
    setImmediate: false,
    tls: "empty"
  },
  output: {
    filename: "[name].js",
    path:__dirname+ "\\admin\\dist",
    // globalObject: "(typeof self !=='undefined?self:this)",
    // publicPath: "/"
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
          maxInitialRequests: 5, // The default limit is too small to showcase the effect
          minSize: 0 // This is example is too small to create commons chunks
        }
      },
      vueAll:{

      }
    }
  },
  plugins: [
    // 这个插件是必须的！ 它的职责是将你定义过的其它规则复制并应用到 .vue 文件里相应语言的块。
    //例如，如果你有一条匹配 /\.js$/ 的规则，那么它会应用到 .vue 文件里的 <script> 块。
    //例如，如果你有一条匹配 /\.css$/ 的规则，那么它会应用到 .vue 文件里的 <style> 块。
    new VueLoaderPlugin(),
    //提取公共文件
  //   new webpack.optimize.CommonsChunkPlugin({
  //     name: 'vendor',
  //     filename: '[name].js'
  // }),
    // new webpack.DefinePlugin({
    //   BASE_URL: "/",
    //   // "process.env": {
    //   //   BASE_URL: "/",
    //   //   NODE_ENV: "development"
    //   // }
    // }),

    //检验路径的大小写
    // new CaseSensitivePathsPlugin(),

    //有颜色区分
    // new FriendlyErrorsWebpackPlugin(),

    // new webpack.HotModuleReplacementPlugin(),
    // 模块热替换,如果不在dev-server模式下，需要记录数据，recordPath，生成每个模块的热更新模块
    // new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      title: 'Hot Module Replacement',
      template:__dirname+"\\src\\public\\index.html",
      filename:"index.html"
//cache:true
// chunks:"all"
// chunksSortMode:"auto"
// compile:true
// excludeChunks:Array(0) []
// favicon:false
// filename:"index.html"
// hash:false
// inject:true
// meta:Object {}
// minify:false
// showErrors:true
// template:"d:\yinming\code\rapserver2-master\client\accout2\public\index.html"
// templateParameters:(compilation, assets, pluginOptions) => { … }
    }),
    // new PreloadPluginPreload({
    //   rel: 'prefetch',
    //   as: 'script',
    //   include: 'asyncChunks',
    //   fileBlacklist: [/\index.css|index.js|vendors.js/, /\.whatever/]
    // }),
    // new PreloadPluginPreload({
    //   rel: 'preload',
    //   as: 'script',
    //   include: 'asyncChunks',
    //   fileBlacklist: [/\index.css|index.js|vendors.js/, /\.whatever/]
    // }),
    // new CopyWebpackPlugin([{from:"./src/main.js"}])
  ],
  resolve: {
    alias: {
      "@": __dirname + "/src",
      "vue$": "vue/dist/vue.runtime.esm.js"
    },
    extensions: [
      ".mjs", ".js", ".jsx", ".vue", ".json", ".wasm"
    ],
    // modules: [
    //   "node_modules",
    //   // __dirname + "/node_modules"
    // ]
  },
  externals:{
    "vue":"Vue"
  }
  //   resolveLoader:{
  //       modules:[

  //       ]
  //   }

}

var compiler = webpack(webpackoptions);
compiler.run(); 
module.exports = webpackoptions

