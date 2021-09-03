// preload.js
const { ipcRenderer, contextBridge } = require('electron');
const { IPC_CHANNELS } = require('./MediaPreviewer/enums');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer,
  IPC_CHANNELS,
});
