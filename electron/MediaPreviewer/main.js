/**
 * 媒体消息预览主进程
 */

const path = require('path');
const { copyFile } = require('fs/promises');
const { BrowserWindow, ipcMain, screen, dialog } = require('electron');
const { IPC_CHANNELS } = require('./enums');
const { isMacOS } = require('./platform');
const { download } = require('electron-dl');
const config = require('../config/env');

const defaultWinWidth = 960;
const defaultWinHeight = 640;

class MediaPreviewer {
  window = null;
  initialState = {};

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
      width: defaultWinWidth,
      height: defaultWinHeight,
      minWidth: defaultWinWidth,
      minHeight: defaultWinHeight,
      center: true,
      frame: false,
      autoHideMenuBar: true,
      nativeWindowOpen: false,
      show: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    previewWin.on('show', () => {
      this.initialState = this.window.getBounds();
      console.log('this.initialState', this.initialState);
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

    // 页面加载完成后(DOMContentLoaded), 发送媒体数据列表
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

  close() {
    this.window.close();
  }
}

/**
 * 使用预览
 * @param {BrowserWindow} mainWindow 程序主窗口
 */
const useMediaPreviewer = (mainWindow) => {
  const previewer = new MediaPreviewer();

  // 打开预览
  async function onMediaPreview(e, data) {
    console.log('IPC_CHANNELS.MEDIA_PREVIEW');
    previewer.init(data);
  }

  // 关闭预览
  async function onMediaPreviewClose(e) {
    console.log('IPC_CHANNELS.MEDIA_PREVIEW_CLOSE');
    previewer.close();
  }

  // 切换到1:1原始尺寸
  function onMediaResizeToOrigin(e, data) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const { naturalWidth, naturalHeight, toolbarHeight } = data;

    // 若图片原始尺寸小于默认窗口尺寸, 则使用默认窗口尺寸进行居中计算
    let calcWidth = 0;
    let calcHeight = 0;
    if (naturalWidth > defaultWinWidth) {
      calcWidth = naturalWidth;
    } else {
      calcWidth = defaultWinWidth;
    }
    if (naturalHeight > defaultWinHeight) {
      calcHeight = naturalHeight;
    } else {
      calcHeight = defaultWinHeight;
    }

    previewer.window.setBounds(
      {
        x: Math.floor((width - calcWidth) / 2),
        y: Math.floor((height - calcHeight) / 2),
        // 因为布局原因, 窗口高度=工具栏高度+图片高度, 故图片在缩放至1:1原始尺寸时, 窗口高度需要加上工具栏高度
        width: naturalWidth + toolbarHeight,
        height: naturalHeight + toolbarHeight,
      },
      true
    );
  }

  // 切换到固定尺寸
  function onMediaResizeToFit(e) {
    previewer.window.setBounds(previewer.initialState, true);
  }

  // 下载
  async function onMediaDownload(e, { uri }) {
    console.log('download uri', uri);
    try {
      await download(previewer.window, uri, {
        saveAs: true,
      });
    } catch (error) {
      dialog.showErrorBox('下载失败', error);
    }
  }

  // TODO: 复制
  async function onMediaCopy(e, { uri }) {
    // console.log('download uri', uri);
    // try {
    //   await copyFile();
    // } catch (error) {
    //   dialog.showErrorBox('复制失败', error);
    // }
  }

  ipcMain.on(IPC_CHANNELS.MEDIA_PREVIEW, onMediaPreview);

  ipcMain.on(IPC_CHANNELS.MEDIA_PREVIEW_CLOSE, onMediaPreviewClose);

  ipcMain.on(IPC_CHANNELS.MEDIA_RESIZE_TO_ORIGIN, onMediaResizeToOrigin);
  ipcMain.on(IPC_CHANNELS.MEDIA_RESIZE_TO_FIT, onMediaResizeToFit);

  ipcMain.on(IPC_CHANNELS.MEDIA_DOWNLOAD, onMediaDownload);
  ipcMain.on(IPC_CHANNELS.MEDIA_COPY_FILE, onMediaCopy);

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
