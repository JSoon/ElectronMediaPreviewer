const { ipcRenderer, IPC_CHANNELS } = window.electron;

export default (): void => {
  // 空格键: 关闭预览
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      ipcRenderer.send(IPC_CHANNELS.MEDIA_PREVIEW_CLOSE);
      document.body.classList.add('fade-out');
    }
  });
};
