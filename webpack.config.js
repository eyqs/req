const path = require('path');
const webpack = require('webpack');
module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    app: './app.jsx',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'req.js',
    publicPath: '/dist/',
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-3']
        }
      }
    ]
  }
};
