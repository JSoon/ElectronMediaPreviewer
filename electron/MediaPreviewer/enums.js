// 事件频道
const IPC_CHANNELS = {
  MEDIA_PREVIEW: 'media-preview',
  MEDIA_PREVIEW_CLOSE: 'media-preview-close',
  MEDIA_RESIZE_TO_ORIGIN: 'media-resize-to-origin',
  MEDIA_RESIZE_TO_FIT: 'media-resize-to-fit',
  MEDIA_FULLSCREEN_TOGGLE: 'media-fullscreen-toggle',
  MEDIA_DOWNLOAD: 'media-download',
  MEDIA_DOWNLOAD_START: 'media-download-start',
  MEDIA_DOWNLOAD_CANCEL: 'media-download-cancel',
  MEDIA_DOWNLOAD_COMPLETE: 'media-download-complete',
  MEDIA_COPY_FILE: 'media-copy-file',
  MEDIA_FORWARD: 'media-forward',
};

module.exports = {
  IPC_CHANNELS,
};
