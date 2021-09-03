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

    previewWin.on('closed', () => {
      this.window.destroy();
      this.window = null;
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

  async function onMediaPreview(e, data) {
    console.log('IPC_CHANNELS.MEDIA_PREVIEW');
    previewer.init(data);
  }

  async function onMediaPreviewClose(e) {
    console.log('IPC_CHANNELS.MEDIA_PREVIEW_CLOSE');
  }

  ipcMain.on(IPC_CHANNELS.MEDIA_PREVIEW, onMediaPreview);

  ipcMain.on(IPC_CHANNELS.MEDIA_PREVIEW_CLOSE, onMediaPreviewClose);

  mainWindow.on('close', (e) => {
    console.log('主窗口要关闭了', mainWindow);
    // 主窗口关闭前, 解除事件绑定, 防止主进程事件重复绑定
    // NOTE: 该代码逻辑需要根据主窗口进行调整, 若主窗口点击关闭仅做隐藏处理, 则无需解除事件绑定
    // ipcMain.off(IPC_CHANNELS.MEDIA_PREVIEW, onMediaPreview);
    // ipcMain.off(IPC_CHANNELS.MEDIA_PREVIEW_CLOSE, onMediaPreviewClose);
  });
};

module.exports = {
  useMediaPreviewer,
};
