/**
 * json -> html
 */

const tag = require('./tag')

let TagMap = makeMap(tag.Tags)
let SelfCloseTagMap = makeMap(tag.SelfCloseTags)

function makeMap(tagArr) {
  let tagMap = {}
  tagArr.forEach(element => {
    tagMap[element] = true
  })
  return tagMap
}

// 普通标签 生成
function createElement(node) {
  let tagName = node.name
  let attrs = node.attribs
  let attrArr = []
  for (const key in attrs) {
    if (attrs.hasOwnProperty(key)) {
      attrArr.push(' ' + key  + '="'  + attrs[key] + '"')
    }
  }
  attrArr = attrArr.join('')

  let child = ''
  let children = node.children
  if (children && children.length) {
    children.forEach(element => {
      if (SelfCloseTagMap[element.name]) {
        child += createSelfCloseElement(element)

      } else if (element.type === 'text') {
        child += createText(element)

      } else {
        child += createElement(element)
      }
    })
  }

  return '<' + tagName + attrArr + '>' + child + '</' + tagName + '>'
}

//自闭合标签 生成
function createSelfCloseElement(node) {
  let tagName = node.name
  let attrs = node.attribs
  let attrArr = []
  for (const key in attrs) {
    if (attrs.hasOwnProperty(key)) {
      attrArr.push(' ' + key  + '="'  + attrs[key] + '"')
    }
    attrArr = attrArr.join('')
  }

  return '<' + tagName + attrArr + '/>'
}

// 文本节点 生成
function createText(text) {
  return text.data
}

// 创建 html 字符串
function compile(node) {
  return createElement(node)
}

module.exports = {
  compile
}