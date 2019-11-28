const path = require("path");

// 简易配置
// 
module.exports = {
  entry: path.resolve(__dirname, 'src'),
  output: path.resolve(__dirname, 'build'),
  ext: 'tm',

  // 插件 todo
  plugin: {
    js: [],// 压缩 混淆 编译
    css: [],// 压缩
    html: []// 压缩
  }
}