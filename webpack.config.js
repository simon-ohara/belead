const path = require('path');
// eslint-disable-next-line node/no-unpublished-require
const HtmlWebpackPlugin = require('html-webpack-plugin');
// eslint-disable-next-line node/no-unpublished-require
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// eslint-disable-next-line node/no-unpublished-require
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    main: ['./src/index.ts', './src/styles/index.scss'],
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
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
    path: path.resolve(__dirname, 'public'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      linkType: 'text/css',
    }),
    new HtmlWebpackPlugin({
      title: 'Path Generator',
      template: './src/assets/index.html',
    }),
  ],
};
