let config = require('../config')
let sha1 = require('sha1')
let {parseString} = require('xml2js')

module.exports = ()=>{
  return async (request,response,next)=>{
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

       3.微信服务器能给开发者服务器发送哪几种“消息”
            --第一种：验证服务器有效性消息 -----  GET类型
            --第二种：转发用户消息  --- POST类型
     */
    const {Token} = config
    const {signature,echostr,timestamp,nonce} = request.query

    //1.将微信服务器携带过来的：timestamp、nonce、Token(事先在网页上约定好的)，放在一个数组里。
    let arr = [timestamp,nonce,Token]
    //2.将上述数组进行字典排序。
    let sortedArr = arr.sort()
    //3.将字典排序后的数组里的每一个元素取出来，拼成一个字符串
    let str = sortedArr.join('')
    //4.将上述字符串，进行sha1加密
    let sha1Str = sha1(str)

    //如果发来的是验证有效性请求
    if(sha1Str === signature && request.method === 'GET'){
      console.log('微信服务器发来验证有效性请求，且验证通过!')
      response.send(echostr)
    }
    
    //如果是转发用户消息
    else if(sha1Str === signature && request.method === 'POST'){
      //微信服务器发过来的：流式数据、数据格式为xml

      //1.获取微信服务器发过来的xml数据
      /*
        <xml>
          <ToUserName><![CDATA[gh_afd83bce98ae]]></ToUserName>
          <FromUserName><![CDATA[o1KCX0_v9SZYkIlfb1NITuA2lL-U]]></FromUserName>
          <CreateTime>1564555310</CreateTime>
          <MsgType><![CDATA[text]]></MsgType>
          <Content><![CDATA[你好]]></Content>
          <MsgId>22399046075081465</MsgId>
        </xml>
      */
      let xmlData = await getXMLData(request)

      //2.将xml数据变成js对象
      /*
        { xml:
           { ToUserName: [ 'gh_afd83bce98ae' ],
             FromUserName: [ 'o1KCX0_v9SZYkIlfb1NITuA2lL-U' ],
             CreateTime: [ '1564555707' ],
             MsgType: [ 'text' ],
             Content: [ '你好' ],
             MsgId: [ '22399052353295960' ] }
       }
      */
      let objData = parseXml2Js(xmlData)
      console.log(objData);

    }

    else{
      response.send('err')
    }

  }
}

//获取微信服务器发过来的xml数据
function getXMLData(request) {
  return new Promise((resolve)=>{
    let result = ''
    request.on('data',(data)=>{
      result += data
    })
    request.on('end',()=>{
      resolve(result)
    })
  })
}

//将xml数据整理成js对象
function parseXml2Js(xmlData) {
  let result = null
  parseString(xmlData,{trim:true},(err,data)=>{
    if(!err){
      result = data
    }else{
      console.log(err)
    }
  })
  return result
}




