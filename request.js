const http = require('http')
const util = require('./util.js')
const querystring = require('querystring')

const login = (password) => {
    return new Promise((res, rej) => {
        var options = {
            hostname: '192.168.10.122',
            path: '/cgi-bin/turbo/admin_web/login_admin?username=admin&password=' + password,
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Host': '192.168.10.122',
                'Referer': 'http://192.168.10.122/login_web.html?from_index_0.07826910198197745',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/52.0.2743.116 Chrome/52.0.2743.116 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }
        let req = http.request(options, (resp) => {
            let cookie = util.parseCookie(resp.rawHeaders)
            cookie['is_mobile'] = 0
            let stok = resp.headers['set-cookie'][0].split(';')[2]
            res([cookie, stok])
        })
        req.on('error', (e) => {
            rej(e)
        })
        req.end()
    })
}

const reboot = ([cookie, stok]) => {
    return new Promise((res, rej) => {
        let Cookie = util.stringifyCookie(cookie)
        let postData = `{"method":"system.os.reboot","data":{}}`
        let options = {
            'hostname': '192.168.10.122',
            'path': `/cgi-bin/turbo/;${stok}/proxy/call?_system.os.reboot`,
            'method': 'POST',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-Length': 39,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                Cookie,
                'Host': '192.168.10.122',
                'Origin': 'http://192.168.10.122',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/52.0.2743.116 Chrome/52.0.2743.116 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }
        let req = http.request(options, (resp) => {
            resp.setEncoding('utf8')
            let data = ''
            resp.on('data', (c) => {
                data += c
            })
            resp.on('end', () => {
                data = JSON.parse(data)
                res(data.code === '0')
            })
        })
        req.on('error', (e) => {
            rej(e)
        })
        req.write(postData)
        req.end()
    })
}

const getOperator = ([cookie, stok]) => {
    return new Promise((res, rej) => {
        let Cookie = util.stringifyCookie(cookie)
        let postData = `{"muticall":"1","mutiargs":[{"method":"network.wan.get_operator","data":{}}]}`
        let options = {
            hostname: '192.168.10.122',
            path: `/cgi-bin/turbo/;${stok}/proxy/call?_get_operator`,
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-Length': 77,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                Cookie,
                'Host': '192.168.10.122',
                'Origin': 'http://192.168.10.122',
                'Referer': `http://192.168.10.122/cgi-bin/turbo/;${stok}/admin_web`,
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/52.0.2743.116 Chrome/52.0.2743.116 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }
        let req = http.request(options, (resp) => {
            resp.setEncoding('utf8')
            let data = ''
            resp.on('data', (c) => {
                data += c
            })
            resp.on('end', () => {
                try {
                    data = JSON.parse(data)
                    let result = !!data.data.results[0].result.data.ip
                    res(result)
                }
                catch (e) {
                    res(false)
                }
            })
        })
        req.on('error', (e) => {
            rej(e)
        })
        req.write(postData)
        req.end()
    })
}

const mainPage = ([cookie, stok]) => {
    return new Promise((res, rej) => {
        let Cookie = util.stringifyCookie(cookie)
        let options = {
            hostname: '192.168.10.122',
            path: `/cgi-bin/turbo/;${stok}/admin_web`,
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, sdch',
                'Accept-Language': 'zh-CN,zh;q=0.8',
                'Cach-Control': 'no-cache',
                'Connection': 'keep-alive',
                Cookie,
                'Host': '192.168.10.122',
                'Referer': 'http://192.168.10.122/login_web.html?from_index_0.07826910198197745',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/52.0.2743.116 Chrome/52.0.2743.116 Safari/537.36',
            }
        }
        let req = http.request(options, (resp) => {
            resp.setEncoding('utf8')
            resp.on('data', (c) => {
                console.log(c)
            })
            resp.on('end', () => {
                res(1)
            })
        })
        req.on('error', (e) => {
            rej(e)
        })
        req.end()
    })
}


module.exports = {
    login,
    reboot,
    getOperator
}
