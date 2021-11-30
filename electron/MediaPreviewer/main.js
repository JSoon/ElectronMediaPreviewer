/**
 * 媒体消息预览主进程
 */

const path = require('path');
const { BrowserWindow, ipcMain, screen, dialog, app } = require('electron');
const { IPC_CHANNELS } = require('./enums');
const { download } = require('electron-dl');
const config = require('../config/env');
const { checkFileExists, copyImageToClipboard, copyFileToClipboard } = require('./utils');
const md5 = require('md5');

const defaultWinWidth = 1024;
const defaultWinHeight = 700;

class MediaPreviewer {
  window = null;
  initialState = {};

  init({
    // 预览媒体项索引号
    index = 0,
    // 预览媒体项
    media = null,
    // 预览媒体列表
    mediaList = [],
  } = {}) {
    // 销毁已有窗口
    if (this.window) {
      this.window.destroy();
      this.window = null;
    }

    const maxWinWidth = screen.getPrimaryDisplay().workAreaSize.width;
    const maxWinHeight = screen.getPrimaryDisplay().workAreaSize.height;

    // 创建新窗口
    const previewWin = new BrowserWindow({
      width: defaultWinWidth,
      height: defaultWinHeight,
      minWidth: defaultWinWidth,
      minHeight: defaultWinHeight,
      maxWidth: maxWinWidth,
      maxHeight: maxWinHeight,
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

    // 开发环境
    if (config.env === 'development') {
      previewWin.loadURL(config.url);
    }
    // 生产环境
    else {
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
 * @param {BrowserWindow} mainWindow  程序主窗口
 * @param {string}        downloadDir 下载文件目录
 */
const useMediaPreviewer = ({ mainWindow, downloadDir }) => {
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

  // 进入/退出全屏 (最大化)
  function onMediaFullscreenToggle(e) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const [winWidth, winHeight] = previewer.window.getSize();
    const isMaximized = winWidth === width && winHeight === height;

    if (!isMaximized) {
      previewer.window.setBounds(
        {
          x: 0,
          y: 0,
          width,
          height,
        },
        false
      );
      return true;
    } else {
      previewer.window.setBounds(previewer.initialState, false);
      return false;
    }
  }

  // 切换到1:1原始尺寸
  function onMediaResizeToOrigin(e, data) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const { naturalWidth, naturalHeight } = data;

    // 若图片原始尺寸小于默认窗口尺寸, 则使用默认窗口尺寸进行居中计算
    // 若图片原始尺寸大于默认窗口尺寸, 则使用屏幕尺寸进行居中计算
    let calcWidth = 0;
    let calcHeight = 0;
    if (naturalWidth > width) {
      calcWidth = width;
    } else if (naturalWidth > defaultWinWidth && naturalWidth <= width) {
      calcWidth = naturalWidth;
    } else {
      calcWidth = defaultWinWidth;
    }
    if (naturalHeight > height) {
      calcHeight = height;
    } else if (naturalHeight > defaultWinHeight && naturalHeight <= height) {
      calcHeight = naturalHeight;
    } else {
      calcHeight = defaultWinHeight;
    }

    previewer.window.setBounds(
      {
        x: Math.floor((width - calcWidth) / 2),
        y: Math.floor((height - calcHeight) / 2),
        width: naturalWidth < width ? naturalWidth : width,
        height: naturalHeight < height ? naturalHeight : height,
      },
      false
    );
  }

  // 切换到固定尺寸
  function onMediaResizeToFit(e) {
    previewer.window.setBounds(previewer.initialState, false);
  }

  // 获取窗口是否最大化
  function onMediaGetPreviewerMaximized(e) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    const [winWidth, winHeight] = previewer.window.getSize();
    const isMaximized = winWidth === width && winHeight === height;
    return isMaximized;
  }

  // 获取预览窗口尺寸
  function onMediaGetPreviewerSize(e) {
    return previewer.window.getBounds();
  }

  // 下载
  async function onMediaDownload(e, { type, uri }) {
    console.log('download uri', uri);
    try {
      await download(previewer.window, uri, {
        saveAs: true,
      });
    } catch (error) {
      dialog.showErrorBox('下载失败', error.message);
    }
  }

  /**
   * 复制图片/视频
   *
   * @description 复制前先下载到本地临时文件地址, 下载成功后, 复制文件到剪切板
   *
   * @param {object} e      IpcMainEvent
   * @param {string} type   复制文件类型: IMG, VIDEO
   */
  async function onMediaCopy(e, { uri, type }) {
    console.log('type', type, 'uri', uri);

    // 下载文件目录
    const DownloadPath = `${app.getPath('temp')}/${downloadDir}/${md5(uri)}`;

    try {
      // 1. 下载文件
      const downloadedItem = await download(previewer.window, uri, {
        directory: DownloadPath,
        async onStarted(item) {
          const filePath = `${DownloadPath}/${item.getFilename()}`;
          const fileMIME = item.getMimeType();
          // 2. 判断文件是否已下载
          const existed = await checkFileExists(filePath);
          // 3. 若已下载, 则直接复制文件
          if (existed) {
            item.cancel();
            console.log('文件已存在', filePath);

            // new Notification({
            //   title: '文件已存储',
            //   body: filePath,
            // }).show();

            if (type === 'IMG') {
              await copyImageToClipboard(filePath);
            } else if (type === 'VIDEO') {
              await copyFileToClipboard(filePath, fileMIME);
            }

            return;
          }
          // 4. 若未下载, 则进行下载
        },
      });

      // 5. 复制下载的文件
      const filePath = downloadedItem.getSavePath();
      const fileMIME = downloadedItem.getMimeType();
      console.log('文件下载到', filePath, fileMIME);

      if (type === 'IMG') {
        await copyImageToClipboard(filePath);
      } else if (type === 'VIDEO') {
        await copyFileToClipboard(filePath, fileMIME);
      }
    } catch (error) {
      dialog.showErrorBox('复制失败', error.message);
    }
  }

  // TODO: 转发
  async function onMediaForward(e, media) {
    console.log('转发', media);
    // 应用自定义逻辑
    // ...
  }

  ipcMain.on(IPC_CHANNELS.MEDIA_PREVIEW, onMediaPreview);

  ipcMain.on(IPC_CHANNELS.MEDIA_PREVIEW_CLOSE, onMediaPreviewClose);

  ipcMain.handle(IPC_CHANNELS.MEDIA_FULLSCREEN_TOGGLE, onMediaFullscreenToggle);

  ipcMain.on(IPC_CHANNELS.MEDIA_RESIZE_TO_ORIGIN, onMediaResizeToOrigin);
  ipcMain.on(IPC_CHANNELS.MEDIA_RESIZE_TO_FIT, onMediaResizeToFit);

  ipcMain.handle(IPC_CHANNELS.MEDIA_GET_PREVIEWER_MAXIMIZED, onMediaGetPreviewerMaximized);
  ipcMain.handle(IPC_CHANNELS.MEDIA_GET_PREVIEWER_SIZE, onMediaGetPreviewerSize);

  ipcMain.on(IPC_CHANNELS.MEDIA_DOWNLOAD, onMediaDownload);
  ipcMain.on(IPC_CHANNELS.MEDIA_COPY_FILE, onMediaCopy);
  ipcMain.on(IPC_CHANNELS.MEDIA_FORWARD, onMediaForward);

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
