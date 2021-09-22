interface Window {
  electron: {
    ipcRenderer: any;
    IPC_CHANNELS: any;
  };
  // 预览组件DOM
  $mediaPreviewerDOM: HTMLElement | null;
}
