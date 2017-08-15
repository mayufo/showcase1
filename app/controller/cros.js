module.exports = app => {
  class CrosController extends app.Controller {
    * index(req) {
      // https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS
      this.ctx.set('Access-Control-Allow-Origin', '*') // * 表示所有的域名
      // this.ctx.set('Access-Control-Allow-Origin', 'http://xx.stuq.com')
      // 如果我们要 http://*.qq.com 都支持跨域怎么办？ 没有办法返回，或者是*或者是特定的域
        // 要根据Reference来返回Access-Control-Allow-Origin
      this.ctx.body = { msg: 'hello world' }
    }
  }
  return CrosController
}
