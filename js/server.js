const http = require('http')
const url = require('url')

const callback = (req,res)=>{

    var rota = url.parse(req.url,true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Content-Type', 'application/json;charset=utf-8')

}

var server = http.createServer(callback)

server.listen(3000)
