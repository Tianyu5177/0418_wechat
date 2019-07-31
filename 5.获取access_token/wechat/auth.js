/*
* 关于access_token说明,备注：该模块不需要借助服务器，可以直接运行
*
*     1.是什么？ 全局接口调用凭据，是开发者的身份唯一标识
*     2.怎么用？每一次调用微信接口的时候，必须携带。
*     3.获取access_token的地址：https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
*     4.特点：
*         1.有效期为2小时，超过2小时自动失效。
*         2.对于认证的账号，每天只能请求2000次
*         3.要求开发人员保存起来access_token，当达到过期时间时，请求新的，随后再次保存。
*         4.如果未达到2小时（之前access_token依然处于有效状态）此时再次请求新的，会导致之前的失效。
*         5.最好提前5分钟获取，（微信的校验规则是：如果8点请求的access_token，如果在9点55分的时候再次请求，微信会让新的和旧的access_token同时有效）
*
 *    5.设计思路：
*           1.第一次调用接口时，去找微信服务器要一个access_token，随后保存。
*           2.第二次调用接口时，读取本地的access_token
*                 判断access_token有效性
*                     --有效：直接用
*                     --失效：找微信服务器要一个access_token，随后保存
*     6.整理思路：
*           一上来就读取本地的
*               --本地有：
*                   --有效：直接使用
*                   --失效：获取新的，随后保存
*               --本地没有：
*                     获取新的，随后保存
*
* */

//引入发请求的库
let rp = require('request-promise-native')
//引入开发者核心配置信息
let {appID,appsecret} = require('../config')
//引入fs模块
let {writeFile,readFile} = require('fs')

class Auth {

  //找微信服务器“要”一个access_token
  async getAccessToken(){
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
    let result = await rp({
      method:'GET',
      url,
      json:true
    })

    if(result){
      console.log('向微信服务器请求access_token成功！')
      result.expires_in = Date.now() + 7200000 - 300000
      return result
    }else{
      console.log('向微信服务器请求access_token失败！')
    }
  }

  //保存获取到的access_token
  saveAccessToken(accessToken){
    return new Promise((resolve,reject)=>{
      writeFile('./access_token.txt',JSON.stringify(accessToken),(err)=>{
        if(!err){
          console.log('保存access_token到本地成功')
          resolve()
        }else{
          console.log('保存access_token到本地失败',err)
          reject()
        }
      })
    })
  }

  //读取
  readAccessToken(){
    return new Promise((resolve)=>{
      readFile('./access_token.txt',(err,data)=>{
        if(!err){
          console.log('读取本地access_token成功')
          resolve(JSON.parse(data.toString()))
        }else{
          console.log('读取本地access_token失败')
          resolve(null)
        }
      })
    })

  }

  //判断是否有效
  isValid(accessToken){
    return accessToken.expires_in > Date.now()
  }

  //调用该方法直接获取到一个可以使用的access_token
  async fetchAccessToken(){
    //一上来就读取
    let readResult = await this.readAccessToken()
    if(readResult){
      //本地有
      if(this.isValid(readResult)){
        console.log('本地的access_token有效')
        //有效
        return readResult
      }else{
        //失效
        console.log('本地的access_token失效')
        let newToken = await this.getAccessToken()
        await this.saveAccessToken(newToken)
        return newToken
      }
    }else{
      //本地没有
      let firstToken = await this.getAccessToken()
      await this.saveAccessToken(firstToken)
      return firstToken
    }
  }

}

;(async()=>{
  let auth = new Auth()
  let result = await auth.fetchAccessToken()
  console.log(result)
})()

/*let {appID,appsecret} = require('../config')
let rp = require('request-promise-native')
let {writeFile,readFile} = require('fs')


class Auth {
  //找微信服务器要一个access_token
  getAccessToken(){
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
    let result = rp({
      url,
      method:'GET',
      json:true
    })
    return result
  }

  //保存获取到的token
  writeAccessToken(token){
    writeFile('./token.txt',JSON.stringify(token),(err)=>{
        if(!err){
          console.log('保存token成功')
        }else{
          console.log('保存token失败',err)
        }
    })
  }
}

(async()=>{
  let auth = new Auth()
  let token = await auth.getAccessToken()
  auth.writeAccessToken(token)
})()*/



















