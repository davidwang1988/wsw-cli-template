const htmlWebpackPlugin = require('html-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'
const config = require('../public/htmlConfig')[isDev ? 'dev' : 'build']
const autoprefixer = require('autoprefixer')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
const isExtractCss = true
const Happypack = require('happypack')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'development',
  // module 模块处理方面配置
  module: {
    // rules 为数组，匹配各种文件类型模块
    rules: [
      // 每条rule常见格式为 test & use
      {
        test: /\.jsx?$/,
        use: 'Happypack/loader?id=js',
        // use: [
        //   // 'cache-loader', // 缓存编译结果的loader，加速打包用
        //   {
        //     loader: "babel-loader",
        //     options: {
        //       presets: ["@babel/preset-env"],
        //       plugins: [
        //         [
        //           "@babel/plugin-transform-runtime",
        //           {
        //             "corejs": 3
        //           }
        //         ]
        //       ],
        //       // cacheDirectory: true //启用编译缓存（自带的）
        //     }
        //   }
        // ],
        // exclude: /node_modules/ // 效率普通
        include: [path.resolve(__dirname, 'src')] // 比较高效
      },
      {
        test: /\.(le|c|sc)ss$/,
        use: [ // 从 后 -> 前 执行
          isExtractCss ? MiniCssExtractPlugin.loader : 'style-loader', // 抽取css文件 或 在页面创建style标签，插入样式
          'css-loader', // 处理import的 css文件
          {
            loader: "postcss-loader",// 给css添加浏览器前缀，配置在 .browserlistrc
            options: {
              plugins: [autoprefixer()]
            }
          },
          'less-loader' // 处理less文件为css文件
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2|tiff)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 1 * 1024, // byte
              esModule: false, // 是否按es6模块导出，图片字体等为false
              name: '[name]_[hash:6].[ext]', // [name]是本身文件名
              outputPath: 'assets' // url-loader 处理的资源存放文件夹 /dist/assets
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        use: ['vue-loader']
      }
    ],
    noParse: /jquery|lodash/, // 不需要webpack编译的包，省点时间，，
  },
  // 各种插件都在这
  plugins: [
    new htmlWebpackPlugin({ // 多页面应用打包时配置多个
      template: './public/index.html',
      filename: 'index.html',
      minify: {
        removeAttributesQuotes: false,
        collapseWhitespace: false
      },
      config: config.template,
      chunks: ['index'],
      // hash: true,
    }),
    // new htmlWebpackPlugin({
    //   template: './public/login.html',
    //   filename: 'login.html',
    //   chunks: ['login'],
    //   // hash: true
    // }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**'] // 不清理提取的公共三方库
    }), // 每次打包时清理dist
    // new CopyWebpackPlugin({ // 拷贝不需要webpack处理的静态资源到dist（某些三方js等）
    //   patterns: [
    //     {
    //       from: './public/js/*.js',
    //       to: path.resolve(__dirname, 'dist', 'js'),
    //       flatten: true // 不拷贝原文件夹，只拷贝文件
    //     }
    //   ]
    // }),
    new webpack.ProvidePlugin({ // 定义全局变量, 慎用
      Vue: ['vue/dist/vue.esm.js', 'default'],
      // $: 'jquery'
    }),
    new MiniCssExtractPlugin({ // 抽取css为文件（未压缩）,便于缓存，避免js包过大
      filename: 'css/[name]_[hash:5].css',
      // publicPath: '/'
    }),
    new OptimizeCssPlugin(), // 压缩抽离的css文件
    // new webpack.HotModuleReplacementPlugin() // 热更新,不用也OK？``
    new Happypack({ // 开启多线程打包js，css等，大项目适合，小项目可能反而慢（配thread-loader也可以，但有些限制）
      id: 'js', // 与module rule use中的id一致
      use: [// 与module rule 中loader写这
        {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-runtime",
                {
                  "corejs": 3
                }
              ]
            ]
          },
          cacheDirectory: true //启用编译缓存（自带的）

        }
      ]
    }),
    // new HardSourceWebpackPlugin() // 超级快的缓存插件，但是可能影响其他配置
    new webpack.DllReferencePlugin({ // 排除已提取的公共库，节省时间
      manifest: path.resolve(__dirname, '../', 'dist', 'dll', 'manifest.json')
    }),
    // new BundleAnalyzerPlugin(), // 可视化输出包们，根据输出，可将大包继续splitChunks
    new VueLoaderPlugin()
  ],
  devServer: {
    port: '3000',
    contentBase: path.resolve(__dirname, '../', 'dist'),
    quiet: false, // 屏蔽控制台编译时输出
    inline: true, // false 为iframe模式
    stats: 'errors-only', // 控制台输出level
    overlay: true, // 浏览器全屏输出错误
    clientLogLevel: 'silent',  // devServer 在浏览器控制台输出client info
    compress: true,
    index: 'index.html' // dev 入口文件
    // hot: true
  },
  // 线上使用none 或 source-map
  devtool: "cheap-module-eval-source-map",
  entry: {//多页面应用打包时配置多个
    index: './src/index.js',
    // login: './src/login.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // 必须绝对路径
    // filename: "boundle_[hash:5].js", // 单入口
    filename: "[name]_[hash:5].js", // 单，多都可以
    // publicPath 别人引到该资源的路径的前半截
    publicPath: isDev ? '/' : "./" //build时通常是cdn地址（如不用cdn则用相对路径'./'引用原资源） ,dev 时为 '/'
  },
  resolve: {
    modules: ['./src/components', 'node_modules'], // 指定查找modules的位置，默认只从node_modules查找
    alias: { // 路径需要resolve一下
      '@myComp': path.resolve(__dirname, './src/components/') // 快速指向自己的组件包
    },
    extensions: ['.ts', '.js', 'web.js'], // 引用时不写后缀名，从左到右依次查找(适配多端时常用)
    mainFields: ['style', 'main'], // import默认找pakageJson中main，但可指定找style


  },
  // externals: { // 模块化使用未打进包的外部库（script引入的），减小包体积
  //   'jquery3': '$' // key定义引入的包名（随便写），val为外部包声明的全局变量（别人定好的）
  // },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {// key自定义，没有意义，规则不重名就行，val是配置对象
          priority: 1, // 当某个模块符合多个拆分规则时，按优先级高的执行拆分, 值越大权重越大
          name: 'vendor22', // 拆分输出包的名字
          test: /node_modules/,
          chunks: "initial", // all所有模块 async异步加载的 initial - 初始就能获取到的
          minSize: 0,// byte 大于这个值才会抽离
          minChunks: 1 // 模块被引用n次及以上被抽出为公共
        },
        vue: { // 单独将vue拆为一个包
          chunks: 'initial',
          name: 'vue-bundle',
          minSize: 100,
          minChunks: 1,
          priority: 2, // 优先级需要高于vendor22包
          test: /[\/]node_modules[\/]vue[\/]/
        }
      }
    },
    runtimeChunk: {  // 将chunk映射关系表从index.js抽出 -- manifest.js
      name: 'manifest'
    }
  }
};
