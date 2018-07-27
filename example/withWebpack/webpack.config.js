const path = require('path');
let res = path.resolve(__dirname, 'dist')

module.exports = {
  mode: "development",
  entry: {
    main: './main.js', 
    'worker.multiply': './worker.multiply.js',
    'worker.sum': './worker.sum.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  }
};
