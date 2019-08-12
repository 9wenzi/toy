function compile(script) {
  return trim(script)
}

function trim(str) {
  return str ? str.trim() : ''
}

module.exports = {
  compile: compile
}