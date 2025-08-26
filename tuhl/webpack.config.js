const webpack = require('webpack');
const path = require('path');
//const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

// This is the path where webpack expects to find all the js files
// which it should bundle up.
const srcPath = path.resolve(__dirname, './src/main/resources/js-src');

// This is the path where webpack will place the built bundles. There
// will be one bundle for every `entry` which is defined below.
const dstPath = path.resolve(__dirname, './src/main/resources/static');

// Add your new app name and its entry point to the `entry` object,
// so that webpack picks it up, builds it and copies the resulting
// bundle into our regular static files folder.
module.exports = {
  entry: {
    'js/analysis.js': path.resolve(srcPath, './analysis/index.js'),
    //'css/analysis.css': path.resolve(srcPath, './analysis/index.css'),
    //'js/texteditor.js': path.resolve(srcPath, './texteditor/index.js'),
    // jquery/jsonForm test module:'js/jQueryPluginTest.js': path.resolve(srcPath, './jQueryPluginTest/index.js'),
    'js/texteditor-ng.js': path.resolve(srcPath, './texteditor-ng/index.js'),
    'js/imageeditor-ng.js': path.resolve(srcPath, './imageeditor-ng/index.js'),
  },
  output: {
    path: path.resolve(dstPath),
    filename: './[name]',
  },
  externals: {
    //react: 'React',
    //'react-dom': 'ReactDOM',
    lodash: '_',
    quill: 'Quill',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: require.resolve('jquery'),
        loader: 'expose-loader',
        options: {
          exposes: ['$', 'jQuery'],
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  },
  plugins: [new ESLintPlugin()],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
