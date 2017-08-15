
# xhr

```js
const xhr = new XMLHttpRequest()

xhr.onreadystatechange = function () {
  switch (xhr.readyState) {
    case 0:
      // UNSENT (未打开)
      debugger
      break
    case 1:
      // OPENED  (未发送)
      debugger
      break
    case 2:
      // HEADERS_RECEIVED (已获取响应头)
      debugger
      break
    case 3:
      // LOADING (正在下载响应体)
      debugger
      break
    case 4:
      // DONE (请求完成)
      if (xhr.status === 200) {
        console.log(xhr.responseType)
        console.log(xhr.responseText)
        console.log(xhr.response)
      }
      break
  }
}

xhr.open('GET', 'http://y.stuq.com:7001/json', true)
xhr.send(null)
```

# 跨域问题


post 会send一些值
get 会带参数  `http://y.stuq.com:7001/json?name=mayufo`
xhr.open('请求方法'， '请求url', 'true表示异步')

##  jsonp


`http://y.stuq.com:7001/json?callback=ss`

相当于在window上挂一个ss的方法，专门处理返回的内容

```js
window.xxx = function (value) {
  console.log(value)
}

var script = document.createElement('script')
script.src = 'http://x.stuq.com:7001/json?callback=xxx'
document.body.appendChild(script)
```
利用没有跨域限制的script标签加载预设的callback将内容传递个给js


> 为什么要防止跨域？

[浏览器同源政策及其规避方法](http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)
[跨域资源共享 CORS 详解](http://www.ruanyifeng.com/blog/2016/04/cors.html)

同源是指协议、域名、端口相同


主要限制

- cookies、 LocalStorage和IndexDB无法读取 (如果没有同源策略,cookie可以共享，网站之间读取登录状态，非常不安全
)
- DOM无法获得 （如果`DOM`可以获取，你可以做个网站用`iframe`嵌套淘宝，我可以通过获取`DOM`来监听你的密码输入）
- AJAX请求不能发送 (公司内网和外网隔离，外网无法内网数据，如果可以请求AJAX请求，内网有个机密的pdf，黑客在外网加一个服务器，内网用户访问这个服务器，通过ajax把pdf下载下来,再上传到他外网的服务器，因为浏览器可以跨域访问)


## CROS

XML2.0 以后出现的新方法

如果你没有设置值，它不会把请求的cookies，带给发送请求的网站

可以设置，这样就会带上请求的cookies

```
xhr.withCredentials = true
```

`caniuse.com` 可以查`xmlhttp`兼容性的网站

对IE8\IE9,需要使用`XDomainRequest`

`CROS` 里面需要设置 `Access-Control-Allow-Origin`


如果我们要 `http://*.qq.com` 都支持跨域怎么办？ 没有办法返回，或者是*或者是特定的域 
要根据Reference来返回Access-Control-Allow-Origin,它只能设置*或者一个特殊的域名，无法实现*.qq.com

```
module.exports = app => {
  class CrosController extends app.Controller {
    * index(req) {
      // https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS
      this.ctx.set('Access-Control-Allow-Origin', '*') // * 表示所有的域名
      // this.ctx.set('Access-Control-Allow-Origin', 'http://xx.stuq.com')
      // 如果我们要 http://*.qq.com 都支持跨域怎么办？ 没有办法返回，或者是*或者是特定的域 
      this.ctx.body = { msg: 'hello world' }
    }
  }
  return CrosController
}
```
## iframe

`onhashchange`当hash变化


被`iframe`嵌套的代码

```js

var xhr = new XMLHttpRequest()
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var res = JSON.parse(xhr.responseText)
        parent.location.href = `http://y.stuq.com:7001/public/3.html#msg=${res.msg}`
    }
}
xhr.open('GET', 'http://x.stuq.com:7001/json', true)
xhr.send(null)

```

在视图中的

```js
var iframe = document.createElement('iframe')
iframe.src = 'http://x.stuq.com:7001/public/hash.html'
document.body.appendChild(iframe)

window.onhashchange = function () {
  // 小练习，做个工具方法，取出query的值
  console.log(location.hash)
}
```

用正则的方法去location.hash

```js

function getParmFromHash(url, parm) {
    var re = new RegExp("#.*[?&]" + parm + "=([^&]+)(&|$)");
    var match = url.match(re);
    return(match ? match[1] : "");
}
```
## window.name

被iframe嵌套的

```js
var xhr = new XMLHttpRequest()
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(xhr.responseText) // 响应的数据
        window.name = xhr.responseText 
        location.href = 'http://y.stuq.com:7001/public/index.html' // 将嵌套的网页设置为相同的域名，此处就变为了同源策略
    }
}
xhr.open('GET', 'http://x.stuq.com:7001/json', true)
xhr.send(null)
```

在视图中的

```js
var iframe = document.createElement('iframe')
iframe.src = 'http://x.stuq.com:7001/public/name.html'
document.body.appendChild(iframe)
// 第一次打开跨域的
// 回到同域的
var times = 0
iframe.onload = function () {
    if (++times === 2) {
        console.log(JSON.parse(iframe.contentWindow.name))
    }
}

```

## postMessage

通过postMessage传递,数据可以相互传递
被`iframe`嵌套的

```js
var xhr = new XMLHttpRequest()
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        parent.postMessage(xhr.responseText, '*')  // * 代表能够接受任何域或者是特定域
    }
}
xhr.open('GET', 'http://x.stuq.com:7001/json', true)
xhr.send(null)
```

在视图中的

```js
var iframe = document.createElement('iframe')
iframe.src = 'http://x.stuq.com:7001/public/post.html'
document.body.appendChild(iframe)

window.addEventListener('message', function(e) {
  console.log(JSON.parse(e.data))
}, false);
```

## require

callback换成define,是和AMD一样的东西

```js
// require(['http://x.stuq.com:7001/json?callback=define'], function (value) {
//   console.log(value)
// })
```

# 跨域五种需要注意的

- `jsonp` 只能`get`请求，不能`post`请求
- `cros`可以post请求还可以带cookies
- 第三方法和第四方法用`iframe`，数据通信不一样
- 其他的跨域解决反向代理（需要后端的协助）、flash
- 一般常用`jsonp`速度比较快，但是后端不想改可以用`iframe`
- 安全性考虑 可以考虑`cros` `postMessage`
- 如果考虑到IE低版本，就无法使用`cros`


`Referer` 就是发起请求，谁来引用的， 后台可以根据这个地址来变成对应的域

# 继承

## es5


- 原型继承

`Animal`需要继承的

```js
function Cat() {}
Cat.prototype = new Animal
Cat.prototype.name = 'cat'
```

- 构造函数

`Animal`需要继承的

```js
function Cat(name) {
  Amimal.call(this)
  this.name = name || 'cat'
}
```

- 组合继承

可以继承原型的方法，且构造函数的方法也被继承

```js
function Cat(name) {
  Animal.call(this)
  this.name = name || 'cat'
}

Cat.prototype = new Aniaml()

// 添加方法
Cat.prototype.say = function() {
  
}
```
在调用`new Aniaml`的时候和`Animal.call`会被创建两次，费内存

- 优化内存

```js
function Cat () {
    Animal.call(this)
    this.name = 'cat'
}

(function() {
  var Super = function() {}
  Super.prototype = Animal.prototype
  
  Cat.prototype = new Super() // 只继承来自Animal.prototype的方法
  // 添加方法
  Cat.prototype.say = function() {
    
  }   
})()
```
