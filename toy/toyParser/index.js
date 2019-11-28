const htmlparser = require('htmlparser')

let handler = new htmlparser.DefaultHandler((err, dom) => {
  if (err) {
    return console.warn(err)
  }
},
{verbose: false, ignoreWhitespace: true}
)

let parser = new htmlparser.Parser(handler)
let getElementsByTagName = htmlparser.DomUtils.getElementsByTagName


function parseData(data) {
  parser.parseComplete(data)

  let template = getElementsByTagName('template', handler.dom)
  template = template ? template[0] : ''

  let script = getElementsByTagName('script', handler.dom)
  script = script ? script[0] : ''
  
  let style = getElementsByTagName('style', handler.dom)
  style = style ? style[0] : ''

  return {
    template,
    script,
    style,
  }
}



module.exports = {
  parseData: parseData
}