const fs = require('fs')
const path = require('path')
const config = require('./config')
const tool = require('./lib')
const entry = config.entry
const output =  config.output

fs.readdir(entry, (err, files) => {
  if (err) {
    return console.err(err)
  }

  if(!files || !files.length) {
    return console.warn('no file')
  }

  files.forEach(file => {
    console.log(file)
    let filePath = path.resolve(entry, file)
    fs.stat(filePath, (err, stats) => {
      if(err) {
        return console.warn(err)
      }

      //判断读取的是文件
      if(stats.isFile()) {
        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            return console.warn(err)
          }

          let filename = getFilename(file, config.ext)
          filePath = path.resolve(output, filename)

          let jsonResult = tool.parse(data)
          
          let style = jsonResult.style
          fs.writeFile(filePath + '.css', style, err => {
            if(err) {
              return console.error(err)
            } 
            console.log('创建' + filePath + ' css文件成功')
          })

          let script = jsonResult.script
          fs.writeFile(filePath + '.js', script, err => {
            if(err) {
              return console.error(err)
            } 
            console.log('创建' + filePath + ' js 文件成功')
          })

          let html = jsonResult.template
          fs.writeFile(filePath + '.html', html, err => {
            if(err) {
              return console.error(err)
            } 
            console.log('创建' + filePath + ' html文件成功')
          })

        })
        return
      }

      //读取文件夹 todo


    }) 
  })
})

function getFilename(file, ext) {
  let end = file.lastIndexOf('.' + ext);
  return file.substring(0, end)
}



