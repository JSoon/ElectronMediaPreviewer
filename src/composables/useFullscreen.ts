import { ref } from 'vue';

export default function useFullscreen() {
  const isFullscreen = ref(false);

  // 监听全屏状态变化
  document.onfullscreenchange = () => {
    if (document.fullscreenElement) {
      isFullscreen.value = true;
      console.log('进入全屏');
    } else {
      isFullscreen.value = false;
      console.log('退出全屏');
    }
  };

  // 进入全屏
  const enterFullscreen = (ele: HTMLElement) => {
    ele.requestFullscreen();
  };

  // 瑞出全屏
  const exitFullscreen = () => {
    document.exitFullscreen();
  };

  // 切换全屏/非全屏
  const toggleFullscreen = () => {
    if (!window.$mediaPreviewerDOM) {
      return;
    }
    if (isFullscreen.value) {
      exitFullscreen();
    } else {
      enterFullscreen(window.$mediaPreviewerDOM);
    }
  };

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
