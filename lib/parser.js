
const htmlparser = require('htmlparser')

const myparser = require('./htmlParser')

let handler = new htmlparser.DefaultHandler((err, dom) => {
	if (err) {
    return console.warn(err)
  }
},
{verbose: false, ignoreWhitespace: true}
)

let parser = new htmlparser.Parser(handler)




function parseData(data) {
  myparser.parseData(data)




  // paser  todo  string -> json 解析算法
  parser.parseComplete(data)
  return {
    template: htmlparser.DomUtils.getElementsByTagName('template', handler.dom),
    script: htmlparser.DomUtils.getElementsByTagName('script', handler.dom),
    style: htmlparser.DomUtils.getElementsByTagName('style', handler.dom),
  }
}



module.exports = {
  parseData: parseData
}