import { ref } from 'vue';

export default function useFullscreen() {
  const { ipcRenderer, IPC_CHANNELS } = window.electron;
  const isFullscreen = ref(false);

  // 切换全屏/非全屏
  const toggleFullscreen = async () => {
    const result = await ipcRenderer.invoke(IPC_CHANNELS.MEDIA_FULLSCREEN_TOGGLE);
    console.log('result', result);
    isFullscreen.value = result;
  };

  return {
    isFullscreen,
    toggleFullscreen,
  };
}
