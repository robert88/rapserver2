const merge = require("deepmerge")

const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const webpack = require("webpack")
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
/**css */
function getCSSconfigByName(name, nameloader) {
  var cssLoaderConfig = [
    { loader: "vue-style-loader", options: { shadowMode: false, sourceMap: false } },
    { loader: MiniCssExtractPlugin.loader},
    { loader: "css-loader"}
  ]
  var loader = cssLoaderConfig.slice(0, cssLoaderConfig.length).concat(nameloader);
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


//vue cli webpack config
var webpackoptions = {
  context: __dirname,
  entry: {
    app: [
      "./src/main.js"
    ]
  },
  mode: "development",
  module: {
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
    {
      test: /\.vue$/,
      use: [
        { loader: "vue-loader",options: {
          extractCSS: true
        } }
      ]
    },
    {
      test: /\.styl(us)?$/,
      oneOf: getCSSconfigByName("stylus", [{ loader: "stylus-loader", options: { sourceMap: false } }])
    },
    {
      test: /\.css$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader
        },
        'css-loader',
      ],
    },
    {
      test: /\.m?jsx?$/,
      use: [
        { loader: "babel-loader" }
      ]
    },
    
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
    path:__dirname+ "\\dist",
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
        },
        vue:{
          test:/vue/,
          name:"vue.min"
        }
      }
    }
  },
  devServer:{

    port:8000,  

    host:'localhost', 

    overlay:{

        errors:true, 

    },

// open:true, 

hot:true 

},
  plugins: [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      // 类似 webpackOptions.output里面的配置 可以忽略
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      title: 'Hot Module Replacement',
      template:__dirname+"\\src\\public\\index.html",
      filename:"index.html",
      chunks: ['app'],
      cache:false
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    extensions: [
      ".mjs", ".js", ".jsx", ".vue", ".json", ".wasm"
    ],
  }
}

// var compiler = webpack(webpackoptions);
// compiler.run(); 
module.exports = webpackoptions

