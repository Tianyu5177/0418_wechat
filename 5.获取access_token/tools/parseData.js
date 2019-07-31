/*
* 该模块用于解析微信服务器发过来的数据，最终解析成js对象
* */
let {parseString} = require('xml2js')
module.exports = {
  //获取微信服务器发过来的xml数据
  getXMLData(request) {
    return new Promise((resolve)=>{
      let result = ''
      request.on('data',(data)=>{
        result += data
      })
      request.on('end',()=>{
        resolve(result)
      })
    })
},

  //将xml数据整理成js对象
  parseXml2Js(xmlData) {
    let result = null
    parseString(xmlData,{trim:true},(err,data)=>{
      if(!err){
        result = data
      }else{
        console.log(err)
      }
    })
    return result
},

  //进一步格式化数据
  formatObjData({xml}) {
  let result = {}
  for (let key in xml){
    result[key] = xml[key][0]
  }
  return result
}
}

