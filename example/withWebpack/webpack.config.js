const path = require('path');
let res = path.resolve(__dirname, 'dist')

console.log(res);

module.exports = {
  mode: "development",
  entry: {
    main: './main.js', 
    multiplyWorker: './multiplyWorker.js',
    sumWorker: './sumWorker.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  }
};
