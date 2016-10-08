#!/usr/local/bin/node

const http = require('http')
const util = require('./util.js')
const request = require('./request.js')
const wlog = util.wlog
const passwd = 'giveup999'
const rebootTime = 1000 * 60 * 5
const loginTime = 1000 * 60
const checkTime = 1000 * 5

let gcookie = ''
let gstok = ''
let lastModified = 0
let isLog = false

let login = () => {
    request.login(passwd).then(([cookie, stok]) => {
        wlog('login success, update cookie...')
        isLog = true
        gcookie = cookie
        gstok = stok
    }).catch((e) => {
        wlog('#error1: ', e)
    })
}

setInterval(login, loginTime)

let checkAndReboot = () => {
    return new Promise((rsl, rej) => {
        if (!gcookie || !gstok) {
            if (lastModified) wlog('cookie does not exist, retry...', gcookie)
            login()
            return rsl({flag: -1})
        }
        let d = new Date().getTime()
        if ((d - lastModified) < rebootTime && !isLog) {
            wlog('restarting... ', (d - lastModified) / 1000, ' s')
            return rsl({flag: 0})
        }
        request.getOperator([gcookie, gstok]).then((res) => {
            if (res) {
                // wlog('online')
                rsl({flag: 0})
            } else {
                wlog('!offline, restart now ')
                lastModified = d
                isLog = false
                request.reboot([gcookie, gstok]).then((res) => {
                    if (res) {
                        wlog('!restart success')
                        rsl({flag: 1})
                    } else {
                        wlog('!restart failed, try to login')
                        login()
                        rsl({flag: -2})
                    }
                }).catch((e) => {
                    wlog('#error3: ', e)
                    rej()
                })
            }
        }).catch((e) => {
            wlog('#error4: ', e)
            rej()
        })
    }).catch((e) => {
        if (e) wlog('#error2: ', e)
    })
}

wlog('----------script start----------')
checkAndReboot()
setInterval(checkAndReboot, checkTime)
