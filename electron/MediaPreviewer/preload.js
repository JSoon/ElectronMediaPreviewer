// preload.js
const { ipcRenderer, contextBridge } = require('electron');
const { IPC_CHANNELS } = require('./enums');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, args) => {
      ipcRenderer.send(channel, args);
    },
    // NOTE: ipcRenderer.on不会暴露到renderer进程中, 需要手动指定
    // https://stackoverflow.com/questions/66913598/ipcrenderer-on-is-not-a-function
    on: (channel, listener) => {
      ipcRenderer.on(channel, listener);
    },
  },
  IPC_CHANNELS,
});
