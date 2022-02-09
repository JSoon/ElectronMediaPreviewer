import { EMediaType } from '@/typings/media';
import useMediaData from './useMediaData';

const { ipcRenderer, IPC_CHANNELS } = window.electron;

// 播放视频
async function playVideo(videoElem: HTMLVideoElement) {
  try {
    await videoElem.play();
  } catch (err) {
    console.error(err);
  }
}

// 切换播放/暂停状态
function handlePlayVideo(videoElem: HTMLVideoElement) {
  if (videoElem.paused) {
    playVideo(videoElem);
  } else {
    videoElem.pause();
  }
}

export default (): void => {
  const { turnToPrev, turnToNext, media } = useMediaData();

  // 空格键, 退出键: 关闭预览
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      // 当前是图片元素, 则关闭
      if (media?.value?.type === EMediaType.IMG) {
        ipcRenderer.send(IPC_CHANNELS.MEDIA_PREVIEW_CLOSE);
      }
      // 当前是视频元素, 则切换播放/暂停
      // NOTE: 若当前按键在视频元素上触发, 则不进行手动操作, 控制权交给视频元素默认行为
      if (e.target !== window.$mediaVideoDOM && media?.value?.type === EMediaType.VIDEO) {
        if (window.$mediaVideoDOM) {
          handlePlayVideo(window.$mediaVideoDOM);
        }
      }
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      ipcRenderer.send(IPC_CHANNELS.MEDIA_PREVIEW_CLOSE);
    }
  });

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
