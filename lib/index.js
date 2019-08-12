const parser = require('./parser')
const styleCompiler = require('./styleCompiler')
const scriptCompiler = require('./scriptCompiler')


function parse(data) {
  let result = parser.parseData(data)

  // 进一步 分别 处理 数据 todos
  // style 处理 todo  预处理器
  let style = ''
  /* if (result.style) {
    style = result.style
    style = style[0].children ? style[0].children : ''
    style = style[0].data ? style[0].data : '' 
    style = style ? styleCompiler.compile(style) : ''
  } */

  //script  todo 资源挂载 ast 树
  let script = ''
  /* if (result.script) {
    script = result.script
    script = script[0].children ? script[0].children : ''
    script = script[0].data ? script[0].data : '' 
    script = script ? scriptCompiler.compile(script) : ''
  } */

  //template 处理  json -> visual node -> real dom
  let template = ''




  return {
    style: style,
    script: script,
    template: template
  }
}




module.exports = {
  parse
}

