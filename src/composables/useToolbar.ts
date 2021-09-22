/**
 * 工具栏
 * @returns
 */
import { reactive, toRefs } from 'vue';

export enum ETxtResize {
  origin = '1:1',
  fit = '固定',
}

// 默认状态
const state = reactive({
  txtToggleResize: ETxtResize.origin,
});

export default function useToolbar() {
  const { ipcRenderer, IPC_CHANNELS } = window.electron;

  // 设置切换显示大小文本
  const setTxtToggleResize = (txt: ETxtResize) => {
    state.txtToggleResize = txt;
  };

  // 图片尺寸显示大小切换
  const originClass = 'origin-size';
  const toggleSize = () => {
    if (!window.$mediaImageDOM) {
      return;
    }
    const isOrigin = window.$mediaImageDOM.classList.contains(originClass);
    if (!isOrigin) {
      resizeToOrigin();
    } else {
      resizeToFit();
    }
  };

  // 切换到1:1原始尺寸
  const resizeToOrigin = () => {
    if (!window.$mediaImageDOM) {
      return;
    }
    const naturalWidth = window.$mediaImageDOM.naturalWidth;
    const naturalHeight = window.$mediaImageDOM.naturalHeight;
    window.$mediaImageDOM.classList.add(originClass);
    setTxtToggleResize(ETxtResize.fit);
    ipcRenderer.send(IPC_CHANNELS.MEDIA_RESIZE_TO_ORIGIN, {
      naturalWidth,
      naturalHeight,
      toolbarHeight: window.$mediaToolbarDOM?.clientHeight || 0,
    });
  };

  // 切换到固定尺寸
  const resizeToFit = () => {
    if (!window.$mediaImageDOM) {
      return;
    }
    window.$mediaImageDOM.classList.remove(originClass);
    setTxtToggleResize(ETxtResize.origin);
    ipcRenderer.send(IPC_CHANNELS.MEDIA_RESIZE_TO_FIT);
  };

  return {
    ...toRefs(state),
    toggleSize,
    resizeToOrigin,
    resizeToFit,
  };
}
