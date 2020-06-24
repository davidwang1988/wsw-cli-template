const speedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new speedMeasurePlugin()
const path = require('path')
const autoprefixer = require('autoprefixer')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin')
const isExtractCss = true
const Happypack = require('happypack')


const moduleConfig = {
  mode: 'production',
  entry: {//多页面应用打包时配置多个
    myModule: './src/components/index.js', // key 为打包后文件名
  },
  output: {
    libraryTarget: 'commonjs2',
    library: 'xxx',
    path: path.resolve(__dirname, '../', 'dist'), // 必须绝对路径
    filename: "[name].js", // 单，多都可以
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false
  },
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
    new CleanWebpackPlugin(), // 每次打包时清理dist
    // new MiniCssExtractPlugin({ // 抽取css为文件（未压缩）,便于缓存，避免js包过大
    //   filename: 'css/[name]_[hash:5].css',
    //   // publicPath: '/'
    // }),
    new OptimizeCssPlugin(), // 压缩抽离的css文件
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
    // new BundleAnalyzerPlugin(), // 可视化输出包们，根据输出，可将大包继续splitChunks
  ]
}

module.exports = smp.wrap(moduleConfig)




