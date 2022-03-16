import path from 'path';

import webpack from 'webpack';
// in case you run into any typescript error when configuring `devServer`
import 'webpack-dev-server';
import nodeExternals from 'webpack-node-externals';

const webpackConfigCommon = require('./.storybook/webpack.config.common');

const config: webpack.Configuration = {
  mode: 'production',
  entry: path.join(__dirname, 'src/index.ts'),
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'axiom-elements.js',
    library: 'axiom-elements',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      ...webpackConfigCommon.rules,
    ],
  },
};

export default config;
