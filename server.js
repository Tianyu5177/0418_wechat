let express = require('express')

let app = express()
app.use(express.urlencoded({extended:true}))

//使用全局中间件，任何类型的请求，任何路由，一定首先经过这里
app.use((request,response,next)=>{
  /*
  * 微信服务器验证开发者服务器有效性时使用的是GET请求，内容如下：
          { signature: '64a5816ea025c749a242dd2fd0616504988f991b',//微信服务器经过特殊加密后的一段随机字符串
            echostr: '7808537269156511705',//微信服务器随机生成的随机字符串
            timestamp: '1564539737',//时间戳
            nonce: '365929207' }//微信服务器随机生成的数字

  * */
  console.log('微信服务器发来消息了')
  console.log(request.query);
})

app.listen(3000,(err)=>{
    if(!err) console.log('服务器启动成功了')
    else console.log(err)
})