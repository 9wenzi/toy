const less = require('less')

function compile(style) {
  return new Promise((resolve, reject) => {
    less.render(style, (e, output) => {
      resolve(output)
    })
  })
}


module.exports = {
  compile: compile
}