const { spawn } = require('child_process')
const electron = require('electron')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const Service = require('@vue/cli-service/lib/Service')
const service = new Service(process.cwd())
// 日志打印
const Log = {
  error (data) {
    let str = data.toString()
    console.log(chalk.red(str))
  },
  success (data) {
    let str = data.toString()
    console.log(chalk.green(str))
  }
}

let electronProcess = null
let electronRestart = false

/**
 * 监听electron文件变化，重启app
 */
function watchFile () {
  fs.watch(
    path.join(__dirname, '../app'),
    {
      recursive: true
    },
    function (eventType, filename) {
      electronRestart = true
      if (electronProcess && electronProcess.pid) {
        process.kill(electronProcess.pid)
      }
      electronProcess = null
      Log.success(eventType + ':' + filename)
      startElectron()
      Log.success('app restart')
      setTimeout(() => {
        electronRestart = false
      }, 5000)
    }
  )
}

function startVue () {
  return service.run('serve').catch(err => {
    Log.error(err)
    process.exit(1)
  })
}

function startElectron () {
  electronProcess = spawn(
    electron,
    [path.join(__dirname, '../app/main.js')],
    {
      env: {
        NODE_ENV: 'development'
      }
    }
  )

  electronProcess.stdout.on('data', data => {
    Log.success(data)
  })
  electronProcess.stderr.on('data', data => {
    Log.error(data)
  })
  electronProcess.on('close', () => {
    if (!electronRestart) process.exit()
  })
}

function init () {
  watchFile()
  startVue().then(() => {
    startElectron()
    console.log(chalk.green(' app start'))
  })
}
init()
