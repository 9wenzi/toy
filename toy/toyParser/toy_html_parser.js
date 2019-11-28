const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)//开始标签开始
const startTagClose = /^\s*(\/?)>///开始标签结束
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ //属性
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) //结束标签
const comment = /^<!--/ //注释
const conditionComment = /^\[/ //条件注释
const doctype =  /^<!DOCTYPE [^>]+/i // doctype

// 创建属性表
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


/**
 * 循环解析 html 字符串
 * 根据 标识符 逐段 判断字符串 匹配模式 截取 字符串 
 * 作为参数 传递
 *
 * @param {string} html  
 * @param {object} options
 */
function parseHtml(html, options){
  
  while(html) {
    let next, text
    let textEnd = html.indexOf('<')
    let rest = html.slice(textEnd)

    if(textEnd === 0) {
          
      //开始标签
      let tag = rest.match(startTagOpen)

      //标签名
      if(tag) {
          rest = rest.substring(tag[0].length)
          html = rest
          tag = tag[1]
        
        // 属性
        let end, attr, attrMap = {}
        while(!(end = rest.match(startTagClose)) && (attr = rest.match(attribute))) {
          rest = rest.substring(attr[0].length)
          html = rest
          attrMap = Object.assign(attrMap, creatAttrMap(attr[0]))
        }
        
        // 开始标签结束部分
        // 判断是否是有自闭合标识 '/'
     
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
      if (comment.test(rest)) {
        let commentEnd = rest.indexOf('-->')
        if (commentEnd >= 0) {
          if (options.shouldKeepComment) {
            options.comment(rest.substring(4, commentEnd))
          }
          rest = rest.substring(commentEnd + 3)
          html = rest
          continue
        }
      }

      // 条件注释
      if (conditionComment.test(rest)) {
        let conditionCommentEnd = conditionComment.test(']>')
        if (conditionCommentEnd >= 0) {
          rest = rest.substring(conditionCommentEnd + 2)
          html = rest
          continue
        }
      }

      // doctype
      let doctypeMatch = rest.match(doctype)
      if (doctypeMatch) {
        rest = rest.substring(doctypeMatch[0].length)
        html = rest
        continue
      }

    }

    if(textEnd > 0){
      // 文本
      while(!endTag.test(rest) && !startTagOpen.test(rest) && !comment.test(rest) && !conditionComment.test(rest)) {
        next = rest.indexOf('<', 1)
        if(next < 0) break
        textEnd += next
        rest = html.slice(textEnd)
      }
      
      text = html.substring(0, textEnd).trim()
      html = rest
      
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

let AST = [] // AST 树

/**
 * 创建普通节点
 *
 * @param {string} tag
 * @param {object} attr
 * @param {string} parent
 * @returns
 */
function createTagNode(tag, attr, parent) {
  return {
    type: 'tag',
    name: tag,
    attrs: attr,
    children: []
  }
}

/**
 * 创建自闭合节点
 *
 * @param {string} tag
 * @param {object} attr
 * @returns
 */
function createUnaryTagNode(tag, attr) {
  return {
    type: 'tag',
    name: tag,
    attrs: attr,
  }
}

/**
 * 创建文本节点 
 *
 * @param {string} text
 * @returns
 */
function createTextNode(text) {
  return {
    type: 'text',
    data: text
  }
}

let stack = []// 根据栈的数据结构 实现 层级

/**
 * 解析 html 根据回调 生成 AST 树
 *
 * @param {string} template
 * @returns
 */
function parseData(template) {
  parseHtml(template, {
    // todo 这里不保险 需要 防止有不规范的标签写法 根据标签名判断 标签种类和标准规范
    
    /**
     * 解析到开始标签 根据 栈 长度  与 自闭合标识 处理
     * 自闭合标签 不进入 栈中 直接 添加到 AST 树中
     * @param {string} tag 标签名
     * @param {object} attrs 属性
     * @param {object} unary 是否有自闭合标识 '/'
     */
    start(tag, attrs, unary) {
      let node
      let i = stack.length

      // 有 自闭合标识
      if (unary.unary) {
        node = createUnaryTagNode(tag,attrs)
        if (i === 0) {
          AST.push(node)
        } else {
          stack[i - 1].children.push(node)
        }
        return
      }
      
      // 无自闭合标识 不是自闭合 标签
      node = createTagNode(tag, attrs)
      if (i === 0) {
        stack.push(node)
        AST.push(node)

      } else {
        stack.push(node)
        stack[i - 1].children.push(node)
      }
      
    },

    // 遇到标签结束
    end(tag) {
      stack.pop()
    },

    // 文本 无需加入栈中
    chars(text) {
      let i = stack.length
      let textNode = createTextNode(text)
      if (i === 0) {
        return AST.push(textNode)
        
      }
      stack[i - 1].children.push(textNode)
    },
    commment(text) {
  
    }
  })
}


module.exports = {
  parseData,
  AST,
}