let express = require('express')
let sha1 = require('sha1')

let app = express()
app.use(express.urlencoded({extended:true}))

//使用全局中间件，任何类型的请求，任何路由，一定首先经过这里
app.use((request,response,next)=>{
  /*
     1.微信服务器验证开发者服务器有效性时请求类型是GET请求，内容如下：
          { signature: '64a5816ea025c749a242dd2fd0616504988f991b',  //微信服务器经过特殊加密后的一段随机字符串
            echostr: '7808537269156511705', //微信服务器随机生成的随机字符串
            timestamp: '1564539737',  //时间戳
            nonce: '365929207' }  //微信服务器随机生成的数字

     2.如何让微信服务器“认可”开发者的服务器？(双向验证)
          --1.将微信服务器携带过来的：timestamp、nonce、Token(事先在网页上约定好的)，放在一个数组里。
          --2.将上述数组进行字典排序。
          --3.将字典排序后的数组里的每一个元素取出来，拼成一个字符串
          --4.将上述字符串，进行sha1加密
          --5.将sha1加密后的字符串与signature进行对比
                --一致：返回给微信服务器echostr
                --不一致：驳回
   */
  const Token = 'atguigu'
  const {signature,echostr,timestamp,nonce} = request.query

  //1.将微信服务器携带过来的：timestamp、nonce、Token(事先在网页上约定好的)，放在一个数组里。
  let arr = [timestamp,nonce,Token]
  //2.将上述数组进行字典排序。
  let sortedArr = arr.sort()
  //3.将字典排序后的数组里的每一个元素取出来，拼成一个字符串
  let str = sortedArr.join('')
  //4.将上述字符串，进行sha1加密
  let sha1Str = sha1(str)
  if(sha1Str === signature){
    console.log('验证通过!')
    response.send(echostr)
  }else{
    response.send('err')
  }

})


app.listen(3000,(err)=>{
    if(!err) console.log('服务器启动成功了')
    else console.log(err)
})