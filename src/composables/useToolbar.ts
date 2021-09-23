/**
 * 工具栏
 * @returns
 */
import { message } from 'ant-design-vue';
import { reactive, toRefs } from 'vue';

export enum ETxtResize {
  origin = '1:1',
  fit = '固定',
}

interface IState {
  txtToggleResize: ETxtResize;
  rotate: number;
  imageInitWidth: number | null;
  imageInitHeight: number | null;
}

// 默认状态
const state: IState = reactive({
  // 尺寸切换文本
  txtToggleResize: ETxtResize.origin,
  // 图片翻转角度
  rotate: 0,
  // 图片初始尺寸
  imageInitWidth: null,
  imageInitHeight: null,
});

// 缩放倍数范围
const maxWidth = 2500;
const minWidth = 200;
const scaleStep = 80;

export default function useToolbar() {
  const { ipcRenderer, IPC_CHANNELS } = window.electron;

  // 设置切换显示大小文本
  const setTxtToggleResize = (txt: ETxtResize) => {
    state.txtToggleResize = txt;
  };

  // 图片尺寸显示大小切换
  const originClass = 'origin-size';
  const toggleSize = () => {
    if (!window.$mediaPreviewerDOM) {
      return;
    }
    const isOrigin = window.$mediaPreviewerDOM.classList.contains(originClass);
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
    window.$mediaPreviewerDOM?.classList.add(originClass);

    const naturalWidth = window.$mediaImageDOM.naturalWidth;
    const naturalHeight = window.$mediaImageDOM.naturalHeight;

    // 横图
    const isLandscape = window.$mediaImageDOM.getAttribute('width');
    // 若图片为横图, 则放大宽度; 否则放大高度
    if (isLandscape) {
      window.$mediaImageDOM.setAttribute('width', `${naturalWidth}`);
    } else {
      window.$mediaImageDOM.setAttribute('height', `${naturalHeight}`);
    }

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
    window.$mediaPreviewerDOM?.classList.remove(originClass);

    // 横图
    const isLandscape = window.$mediaImageDOM.getAttribute('width');
    // 若图片为横图, 则设置宽度; 否则设置高度
    if (isLandscape) {
      window.$mediaImageDOM.setAttribute('width', `${state.imageInitWidth}`);
    } else {
      window.$mediaImageDOM.setAttribute('height', `${state.imageInitHeight}`);
    }

    setTxtToggleResize(ETxtResize.origin);
    ipcRenderer.send(IPC_CHANNELS.MEDIA_RESIZE_TO_FIT);
  };

  // 翻转
  const rotate = () => {
    if (!window.$mediaImageDOM) {
      return;
    }
    state.rotate += 90;
    // 若是90的奇数倍, 则缩小.x倍
    if ((state.rotate / 90) % 2 === 1) {
      window.$mediaImageDOM.style.transform = `rotate(${state.rotate}deg) scale(.8)`;
    } else {
      window.$mediaImageDOM.style.transform = `rotate(${state.rotate}deg) scale(1)`;
    }
  };

  // 设置图片初始化尺寸
  const setImageInitSize = (w: IState['imageInitWidth'], h: IState['imageInitHeight']) => {
    state.imageInitWidth = w;
    state.imageInitHeight = h;
    console.log('state', state.imageInitWidth, state.imageInitHeight);
  };

  // 放大
  const zoomIn = () => {
    if (!window.$mediaImageDOM) {
      return;
    }
    if (window.$mediaImageDOM.clientWidth > maxWidth) {
      message.info('已经放至最大了', 1);
      return;
    }
    // 横图
    const isLandscape = window.$mediaImageDOM.getAttribute('width');
    // 竖图
    const isPortrait = window.$mediaImageDOM.getAttribute('height');
    // 若图片为横图, 则放大宽度; 否则放大高度
    if (isLandscape) {
      const w = Number(isLandscape);
      window.$mediaImageDOM.setAttribute('width', `${w + scaleStep}`);
    } else {
      const h = Number(isPortrait);
      window.$mediaImageDOM.setAttribute('height', `${h + scaleStep}`);
    }
  };

  // 缩小
  const zoomOut = () => {
    if (!window.$mediaImageDOM) {
      return;
    }
    if (window.$mediaImageDOM.clientWidth < minWidth) {
      message.info('已经缩至最小了', 1);
      return;
    }
    // 横图
    const isLandscape = window.$mediaImageDOM.getAttribute('width');
    // 竖图
    const isPortrait = window.$mediaImageDOM.getAttribute('height');
    // 若图片为竖图, 则放大高度; 否则放大宽度
    if (isLandscape) {
      const w = Number(isLandscape);
      window.$mediaImageDOM.setAttribute('width', `${w - scaleStep}`);
    } else {
      const h = Number(isPortrait);
      window.$mediaImageDOM.setAttribute('height', `${h - scaleStep}`);
    }
  };

  // 图片尺寸溢出样式
  const overflowClass = 'overflow';
  function adjustOverflow() {
    if (!window.$mediaImageDOM || !window.$mediaPreviewerDOM) {
      return;
    }
    window.$mediaImageDOM.addEventListener('transitionend', () => {
      if (!window.$mediaImageDOM || !window.$mediaPreviewerDOM) {
        return;
      }
      // 设置样式
      if (window.$mediaImageDOM.clientHeight > window.$mediaPreviewerDOM.clientHeight) {
        window.$mediaImageDOM.classList.add(overflowClass);
      } else {
        window.$mediaImageDOM.classList.remove(overflowClass);
      }
    });
  }

  // 重置状态
  const reset = () => {
    resizeToFit();
    state.rotate = 0;
  };

  return {
    ...toRefs(state),
    toggleSize,
    resizeToOrigin,
    resizeToFit,
    rotate,
    setImageInitSize,
    zoomIn,
    zoomOut,
    adjustOverflow,
    reset,
  };
}
