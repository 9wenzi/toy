const fs = require('fs')

const http = require('http')

let app = http.createServer((req, res) => {
  

  if(req.url === '/') {
    fs.readFile('./upload.html', 'utf8', (err, data) => {
      if (err) {
        return console.error(err)
      }
      res.end(data)
    })

  }

  if (req.url === '/upload') {
    console.log(res.url)
    let body =  ''
    
    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      console.log(body)
      res.end(typeof body)
    })
  }

})

app.listen(9000)


