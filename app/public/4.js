var iframe = document.createElement('iframe')
iframe.src = 'http://x.stuq.com:7001/public/name.html'
document.body.appendChild(iframe)

var times = 0

// 第一次打开跨域的
// 回到同域的
iframe.onload = function () {
    if (++times === 2) {
        console.log(JSON.parse(iframe.contentWindow.name))
    }
}
