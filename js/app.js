const http = require('http')
const url = require('url')

const callback = (req,res)=>{

    var rota = url.parse(req.url,true)
    res.writeHead(200,{'content-type':'application/json;charset=utf-8'})

}

var server = http.createServer(callback)

server.listen(3000)
