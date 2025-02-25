const path = require('path');

module.exports = {
  entry: './src/index.js', // Adjust the path to your entry file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'chatbot.bundle.js',
    library: 'Chatbot',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
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
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
    ],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
