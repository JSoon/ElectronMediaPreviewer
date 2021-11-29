import { ref } from 'vue';
import useToolbar from './useToolbar';

export default function useFullscreen() {
  const { ipcRenderer, IPC_CHANNELS } = window.electron;
  const isFullscreen = ref(false);
  const { toggleMaximize } = useToolbar();

  const updateFullscreen = async () => {
    const result = await ipcRenderer.invoke(IPC_CHANNELS.MEDIA_GET_PREVIEWER_MAXIMIZED);
    isFullscreen.value = result;
    console.log('更新全屏状态', isFullscreen.value);
  };

  // 切换全屏/非全屏
  const toggleFullscreen = async () => {
    const result = await ipcRenderer.invoke(IPC_CHANNELS.MEDIA_FULLSCREEN_TOGGLE);
    isFullscreen.value = result;
    toggleMaximize();
    console.log('切换全屏/非全屏', isFullscreen.value);
  };

  return {
    isFullscreen,
    updateFullscreen,
    toggleFullscreen,
  };
}
