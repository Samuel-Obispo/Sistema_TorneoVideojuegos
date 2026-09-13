const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const port = Number(process.env.PORT || 3000)
const root = __dirname
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' }

http.createServer((request, response) => {
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0]
  const filePath = path.join(root, requested)
  if (!filePath.startsWith(root)) { response.writeHead(403); response.end('Forbidden'); return }
  fs.readFile(filePath, (error, content) => {
    if (error) { response.writeHead(404); response.end('Not found'); return }
    response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'text/plain; charset=utf-8' })
    response.end(content)
  })
}).listen(port, () => console.log(`Torneo Express disponible en http://localhost:${port}`))
