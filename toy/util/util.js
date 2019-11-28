function isEmptyObject(object) {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      return false
    }
  }

  return true
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


function isEmptyChar(char) {
  return /[\s\f\n\r\t\v]/.test(char)
}

function isCloseChar(char) {
  return char === '>'
}

module.exports = {
  isEmptyObject
}