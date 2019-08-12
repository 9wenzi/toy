const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)//开始标签开始
const startTagClose = /^\s*(\/?)>///开始标签结束
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?///属性
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)//闭合标签

const Tags = ['div', 'template', 'p', 'span', 'i', 'section', 'strong', 'form', 'label', 'video', 'audio', 'canvas','style', 'textarea', 'script' ]
const SelfCloseTags = ['input', 'img', 'br']

function isEmptyChar(char) {
  return /[\s\f\n\r\t\v]/.test(char)
}

function isCloseChar(char) {
  return char === '>'
}


function createTagNode(tag, attr, parent) {
  return {
    type: 'tag',
    name: tag,
    attrs: attr,
    children: []
  }
}

function createTextNode(text) {
  return {
    type: 'text',
    data: text
  }
}

function assin(target, source) {
  if(Object.prototype.assin) {
    return Object.assign(target, source)
  }
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key]
    }
  }
  return target
}

function creatAttrMap(attr) {
  attr = attr.trim().split('=')
  let key = attr[0], 
      value = attr[1]
  if (Object.prototype.toString.call(attr[1]) === '[object Undefined]' || Object.prototype.toString.call(attr[1]) === '[object Null]') {
    value = attr[0]
  } else {
    value = value.replace(/\s+/g,'').replace(/^['"]/, '').replace(/['"]$/, '')
  }
  return {
    [key]: value
  }
}

let stack = []



function parseHtml(html, options){
  
  while(html) {
    let next, text
    let textEnd = html.indexOf('<')
    let rest = html.slice(textEnd)

    if(textEnd === 0) {
          
      //开始标签
      let tag = rest.match(startTagOpen)
      if(tag) {
          rest = rest.substring(tag[0].length)
          html = rest
          tag = tag[1]
        
        let end, attr, attrMap = {}
        while(!(end = rest.match(startTagClose)) && (attr = rest.match(attribute))) {
          rest = rest.substring(attr[0].length)
          html = rest
          attrMap = assin(attrMap, creatAttrMap(attr[0]))
        }
        
        end = rest.match(startTagClose)
        let isUnary = {unary: ''}
        if(end) {
          rest = rest.substring(end[0].length)
          html = rest
          isUnary.unary = end[1]
        }

        if(options.start) {
          options.start(tag, attrMap, isUnary)
        }
        continue
      }
      
      //结束标签
      let endTagMatch = rest.match(endTag)
      if(endTagMatch) {
        rest = rest.substring(endTagMatch[0].length)
        html = rest

        if (options.end) {
          options.end(endTagMatch[1])
        }
        continue
      }

      // 注释

      // 条件注释

      // doctype
  
    }

    if(textEnd > 0){
      // 文本
      while(!endTag.test(rest) && !startTagOpen.test(rest)) {
        next = rest.indexOf('<', 1)
        if(next < 0) break
        textEnd += next
        rest = html.slice(textEnd)
      }
      
      text = html.substring(0, textEnd).trim()
      html = rest
      console
      if(options.chars && text) {
        options.chars(text)
      }
      continue
    }

    if(textEnd < 0) {
      text = html
      html = ''
      options.chars(text)
    }

  }
  
}

function parseData(data) {
  parseHtml(data, {
    start(tag, attrs, unary) {
      console.log(tag)
    },
    end(tag) {
      console.log(tag)
    },
    chars(text) {
      console.log(text)
    },
    commment(text) {
  
    }
  })



}
module.exports = {
  parseData
}