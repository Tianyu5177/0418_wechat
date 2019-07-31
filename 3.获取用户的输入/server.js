let express = require('express')
let requestHandler = require('./wechat/requestHandler')

let app = express()
app.use(express.urlencoded({extended:true}))

//使用全局中间件，任何类型的请求，任何路由，一定首先经过这里
app.use(requestHandler())


app.listen(3000,(err)=>{
  if(!err) console.log('服务器启动成功了')
  else console.log(err)
})