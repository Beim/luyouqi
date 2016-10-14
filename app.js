#!/usr/local/bin/node

const http = require('http')
const util = require('./util.js')
const request = require('./request.js')
const wlog = util.wlog

const passwd = 'giveup999'
const rebootTime = 1000 * 60 * 10
const loginTime = 1000 * 60 * 10
const checkTime = 1000 * 10

let gcookie = ''
let gstok = ''
let lastReboot = new Date().getTime() - rebootTime - 1
let lastLogin = new Date().getTime() - loginTime - 1
let isLog = false
let offlineCheck = 0
// let lastModified = 0

let login = () => {
    request.login(passwd).then(([cookie, stok]) => {
        isLog = true
        lastLogin = new Date().getTime()
        gcookie = cookie
        gstok = stok
        wlog('login success, update cookie...')
    }).catch((e) => {
        isLog = false
        gcookie = ''
        gstok = ''
        wlog('#login#error1: ', e)
    })
}

let checkAndReboot = () => {
    let d = new Date().getTime()
    // 距离上次重启时间小于rebootTime 时无操作
    if ((d - lastReboot) < rebootTime) {
        return wlog('reboot time~ ', (d - lastReboot) / 1000, 's')
    }
    // 未登录, 或者登陆超时时, 尝试登陆
    if (!isLog || ((d - lastLogin) > loginTime) ) {
        wlog('try to login...')
        return login()
    }
    // 此时已登陆, cookie有效, 距离上次重启时间足够长
    // 检测是否在线
    request.getOperator([gcookie, gstok]).then((res) => {
        if (res) {
            offlineCheck = 0 // 在线, 重置检测到不在线的次数
            let d1 = new Date(lastLogin).toLocaleTimeString()
            let d2 = new Date(lastReboot).toLocaleTimeString()
            wlog(`online, lastLogin: ${d1}, lastReboot: ${d2}`)
        } else if (offlineCheck < 3) { // 若不在线, 且检测到不在线的次数小于3, 将offlineCheck 加一
            wlog('!maybe offline, offlineCheck = ', ++offlineCheck)
        } else { // 检测到3 次不在线, 尝试重启
            wlog('!offline, restart now')
            offlineCheck = 0 // 重置检测到不在线的次数
            request.reboot([gcookie, gstok]).then((res) => {
                isLog = false
                if (res) {
                    lastReboot = new Date().getTime()
                    wlog('!restart success')
                } else {
                    wlog('!restart failed')
                }
            }).catch((e) => {
                wlog('#reboot#error3: ', e)
            })
        } 
    }).catch((e) => {
        wlog('#getOperator#error2: ', e)
    })
}


wlog('----------script start----------')
checkAndReboot()
setInterval(checkAndReboot, checkTime)


// setInterval(login, loginTime)

// let checkAndReboot = () => {
//     return new Promise((rsl, rej) => {
//         if (!gcookie || !gstok) {
//             if (lastModified) wlog('cookie does not exist, retry...', gcookie)
//             login()
//             return rsl({flag: -1})
//         }
//         let d = new Date().getTime()
//         if ((d - lastModified) < rebootTime && !isLog) {
//             wlog('restarting... ', (d - lastModified) / 1000, ' s')
//             return rsl({flag: 0})
//         }
//         request.getOperator([gcookie, gstok]).then((res) => {
//             if (res) {
//                 // wlog('online')
//                 rsl({flag: 0})
//             } else {
//                 wlog('!offline, restart now ')
//                 lastModified = d
//                 isLog = false
//                 request.reboot([gcookie, gstok]).then((res) => {
//                     if (res) {
//                         wlog('!restart success')
//                         rsl({flag: 1})
//                     } else {
//                         wlog('!restart failed, try to login')
//                         login()
//                         rsl({flag: -2})
//                     }
//                 }).catch((e) => {
//                     wlog('#error3: ', e)
//                     rej()
//                 })
//             }
//         }).catch((e) => {
//             wlog('#error4: ', e)
//             rej()
//         })
//     }).catch((e) => {
//         if (e) wlog('#error2: ', e)
//     })
// }
