const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mode = process.env.NODE_ENV || 'production';

module.exports = {
  devServer: {
    static: {
      directory: path.resolve(__dirname, './example-app'),
    },
    client: {
      overlay: true,
    },
    compress: false,
    port: 4600
  },
  entry: {
    index: './example-app/index.ts'
  },
  mode,
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, './example-app'),
    filename: 'index.js',
  },
  plugins: [new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './example-app/template.html')
  })]
};