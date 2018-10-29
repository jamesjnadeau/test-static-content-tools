var pathUtil = require('path');
var glob = require('glob');
var webpack = require('webpack');
// var critical = require('critical');

//Plugins
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var PurgecssPlugin = require('purgecss-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var staticSiteLoader = require('./static-site-loader');
var CleanWebpackPlugin = require('clean-webpack-plugin');
// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var version = require('package')(__dirname).version;
console.log('Version', version);
var env = {
  version: version,
  NODE_ENV: process.env.NODE_ENV,
};

var plugins = [
  new CleanWebpackPlugin(['built']),
  /* new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false, // access it at /report.html
  }),*/
  new ExtractTextPlugin("[name].css", { sourceMap: true }), // allChunks: true,
  /*
  new CopyWebpackPlugin([
    //Copy folders in wholesale
    // { from: 'assets/files', to: 'files' },
    // { from: 'files/manifest.json', to: 'manifest.json' },
  ]),
  */
  // make jQuery available everywhere
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
  }),
  // define ENV variables
  new webpack.DefinePlugin({
    env: JSON.stringify(env),
  }),
  new webpack.LoaderOptionsPlugin({
    options: {
      staticSiteLoader: staticSiteLoader,
    },
  }),
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
  }),
];

if (process.env.NODE_ENV === 'production') {
  /* this makes source maps not work */
  new PurgecssPlugin({
    paths: function () {
      var contentDir = pathUtil.resolve(__dirname, './content');
      var files = glob.sync(contentDir + '/**', { //.(md|jade)
        nodir: true,
      });

      var templateDir = pathUtil.join(__dirname, 'templates');
      files = files.concat(glob.sync(templateDir + '/**', { //.(md|jade)
        nodir: true,
      }));
      var jsDir = pathUtil.join(__dirname, 'assets/js');
      files = files.concat(glob.sync(jsDir + '/**', { //.(md|jade)
        nodir: true,
      }));

      return files;
    },
  });
}

var styleLoader = ExtractTextPlugin.extract({
  fallback: 'style-loader?sourceMap',
  use: [{
    loader: 'css-loader',
    options: { sourceMap: true, minimize: true },
  }, {
    loader: 'less-loader',
    options: { sourceMap: true },
  }],
});

module.exports = {
  //enable source-maps
  devtool: 'source-map',

  module: {
    loaders: [
      { test: /\.html$/, loader: "html-loader" },
      { test: /\.(css|less)$/,
        loader: styleLoader
      },
      { test: /\.(jpe?g|png|gif)$/, loader: 'file-loader' },
      // taken from gowravshekar/bootstrap-webpack
      { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=application/font-woff' }, //eslint-disable-line
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=application/octet-stream' }, //eslint-disable-line
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=image/svg+xml' },
    ],
  },

  entry: {
    'site-generator': 'static-site-loader!./content',
    frontend: './src/js/index.js',
    styles: './src/styles/index.js',
    // 'service-worker': './assets/js/service-worker.js',
  },
  output: {
    filename: "[name].js",
    chunkFilename: "[id].js",
    path: pathUtil.resolve(__dirname, 'built'),
    libraryTarget: 'umd',
    sourceMapFilename: '[file].map',
    devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
  },

  plugins: plugins,

  devServer: {
    contentBase: pathUtil.resolve(__dirname, 'built'),
    overlay: true,
    proxy: {
      "/.netlify": {
        target: "http://localhost:9000",
        pathRewrite: { "^/.netlify/functions": "" }
      }
    }
    // port: process.env.PORT,
    // historyApiFallback: true,
    // publicPath: "./built",
    // open: false,
    // hot: false
  },

};