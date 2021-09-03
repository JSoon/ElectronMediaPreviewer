/**
 * 媒体消息预览主进程
 */

const path = require('path');
const { BrowserWindow, ipcMain } = require('electron');
const { IPC_CHANNELS } = require('./enums');
const config = require('../config/env');

class MediaPreviewer {
  window = null;

  init({
    // 预览媒体项索引号
    index = 0,
    // 预览媒体项
    media = '',
    // 预览媒体列表
    mediaList = [],
  } = {}) {
    // 销毁已有窗口
    if (this.window) {
      this.window.destroy();
      this.window = null;
    }

    // 创建新窗口
    const previewWin = new BrowserWindow({
      width: 960,
      height: 640,
      minWidth: 960,
      minHeight: 640,
      center: true,
      autoHideMenuBar: true,
      show: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    if (config.env === 'development') {
      previewWin.loadURL(config.url);
    } else {
      previewWin.loadFile(config.url);
    }

    // 页面加载完成后, 发送媒体数据列表
    previewWin.webContents.on('did-finish-load', () => {
      previewWin.webContents.send(IPC_CHANNELS.MEDIA_PREVIEW, {
        index,
        media,
        mediaList,
      });
    });

    // previewWin.webContents.openDevTools();

    this.window = previewWin;
  }
}

/**
 * 使用预览
 * @param {BrowserWindow} mainWindow 程序主窗口
 */
const useMediaPreviewer = (mainWindow) => {
  const previewer = new MediaPreviewer();

  ipcMain.on(IPC_CHANNELS.MEDIA_PREVIEW, async (e, data) => {
    console.log('IPC_CHANNELS.MEDIA_PREVIEW', data);
    previewer.init(data);
  });

  ipcMain.on(IPC_CHANNELS.MEDIA_PREVIEW_CLOSE, async (e) => {
    console.log('IPC_CHANNELS.MEDIA_PREVIEW_CLOSE');
  });
};

module.exports = {
  useMediaPreviewer,
};
