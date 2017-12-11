'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * 发送自动更新相关状态
 * @param {*} text 更新描述
 */
function sendAutoUpdateStatus (text) {
  mainWindow.webContents.send('autoUpdateStatus', text)
}

ipcMain.on('checkUpdate', (event, arg) => {
  autoUpdater.checkForUpdatesAndNotify()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */
autoUpdater.on('checking-for-update', () => {
  sendAutoUpdateStatus('正在检查更新...')
})

autoUpdater.on('update-available', info => {
  sendAutoUpdateStatus('发现新版本～，开始下载...')
  // autoUpdater.downloadUpdate()
})

autoUpdater.on('update-not-available', info => {
  sendAutoUpdateStatus('已经是最新版本~')
})

autoUpdater.on('error', info => {
  sendAutoUpdateStatus(`更新出错：${info}`)
})

autoUpdater.on('download-progress', (processObj) => {
  // let text = `下载速度${processObj.bytesPerSecond}，已下载${processObj.percent}%（${processObj.transferred}/${processObj.total}）`
  let text = `已下载${parseInt(processObj.percent)}%`

  sendAutoUpdateStatus(text)
})

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  createWindow()

  // if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
