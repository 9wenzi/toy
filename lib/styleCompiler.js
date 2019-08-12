function compile(style) {
  return trim(style)
}

function trim(str) {
  return str ? str.trim() : ''
}

module.exports = {
  compile: compile
}