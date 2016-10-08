const fs = require('fs')
const path = require('path')

const parseCookie = (rawHeader) => {
    let flag = false
    let result = rawHeader.reduce((total, curr) => {
        if (!flag && curr === 'Set-Cookie') {
            flag = true
        } else if (flag) {
            let cookie = curr.split(';')[0].split('=')
            let key = cookie.shift()
            let value = cookie.join('=')
            total[key] = value
            flag = false
        }
        return total
    }, {})
    return result
}

const stringifyCookie = (cookie) => {
    let res = ''
    for (let i in cookie) {
        res += `${i}=${cookie[i]}; `
    }
    return res.slice(0, -2)
}

const parseHeader = (rawHeader) => {
    let flag = false
    let result = {}
    for (let i = 0; i < rawHeader.length; i += 2) {
        if (!result[rawHeader[i]]) {
            result[rawHeader[i]] = rawHeader[i+1]
        } else {
            if (typeof result[rawHeader[i]] !== 'string') {
                result[rawHeader[i]].push(rawHeader[i+1])
            } else {
                result[rawHeader[i]] = [result[rawHeader[i]], rawHeader[i+1]]
            }
        }
    }
    return result
}

const updateCookie = (curr, next) => {
    for (let i in next) {
        if (next[i] !== '') {
            curr[i] = next[i]
        }
    }
    return curr
}

const run = (gen) => {
    let g = gen()
    let next = (data) => {
        let result = g.next(data)
        // if (result.done) return result.value;
        if (result.done) return ;
        result.value.then((data) => {
            next(data)
        })
    }
    next()
}

const print = (obj) => {
    if (typeof obj === 'object') 
        console.log(JSON.stringify(obj, null, 4))
    else 
        console.log(obj)
}

const wlog = (...msg) => {
    let d = new Date().toLocaleDateString()
    const LOG = path.resolve(__dirname, `./log/${d}.log.out`)
    msg.splice(0, 0, new Date().toLocaleTimeString())
    msg.push('\n')
    msg = msg.join(' ')
    fs.writeFile(LOG, msg, {flag: 'a'}, (err) => {
        if (err) console.log(err)
    })
}

module.exports = {
    parseCookie,
    stringifyCookie,
    parseHeader,
    updateCookie,
    print,
    run,
    wlog,
}
