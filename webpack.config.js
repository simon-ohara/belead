const path = require('path');
// eslint-disable-next-line node/no-unpublished-require
const HtmlWebpackPlugin = require('html-webpack-plugin');
// eslint-disable-next-line node/no-unpublished-require
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
    watchFiles: ['src/**/*', 'assets/**/*'],
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'path-generator.bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Path Generator',
      template: './assets/index.html',
    }),
  ],
};
