const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = async env => {
  console.log('webpack config')
  return {
    entry: './src/index.tsx',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/,
          use: [ 'style-loader', 'css-loader', 'sass-loader' ],
        },
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
    ],
    stats: 'minimal',
  }
}
