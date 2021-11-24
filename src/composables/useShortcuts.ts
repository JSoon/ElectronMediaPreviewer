import useMediaData from './useMediaData';

const { ipcRenderer, IPC_CHANNELS } = window.electron;

export default (): void => {
  const { turnToPrev, turnToNext } = useMediaData();

  // 空格键, 退出键: 关闭预览
  // document.addEventListener('keyup', (e) => {
  //   if (e.code === 'Space' || e.code === 'Escape') {
  //     e.preventDefault();
  //     ipcRenderer.send(IPC_CHANNELS.MEDIA_PREVIEW_CLOSE);
  //   }
  // });

  // 禁用刷新
  document.addEventListener('keydown', (e) => {
    // 禁用刷新
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyR') {
      e.preventDefault();
    }
    if (e.code === 'F5') {
      e.preventDefault();
    }
  });

  // 切换上下页
  document.addEventListener('keyup', (e) => {
    // 左键/上键
    if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
      e.preventDefault();
      turnToPrev();
    }
    // 右键/下键
    else if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
      e.preventDefault();
      turnToNext();
    }
  });
};
