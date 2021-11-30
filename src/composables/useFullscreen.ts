import { ref } from 'vue';

export default function useFullscreen() {
  const { ipcRenderer, IPC_CHANNELS } = window.electron;
  const isFullscreen = ref(false);

  // 切换全屏/非全屏
  const toggleFullscreen = () => {
    ipcRenderer.invoke(IPC_CHANNELS.MEDIA_FULLSCREEN_TOGGLE);
  };

  ipcRenderer.on(IPC_CHANNELS.MEDIA_WINDOW_MAXIMIZED, () => {
    console.log('窗口进入最大化');
    isFullscreen.value = true;
  });

  ipcRenderer.on(IPC_CHANNELS.MEDIA_WINDOW_UNMAXIMIZED, () => {
    console.log('窗口退出最大化');
    isFullscreen.value = false;
  });

  return {
    isFullscreen,
    toggleFullscreen,
  };
}
