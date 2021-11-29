/**
 * 工具栏
 * @returns
 */
import { message } from 'ant-design-vue';
import { reactive, toRefs } from 'vue';
import { IMediaItem } from '@/typings/media';

export enum EResizeTxt {
  origin = '1:1',
  fit = '固定',
}

interface IState {
  toggleResizeTxt: EResizeTxt;
  rotate: number;
  imageInitWidth: number;
  imageInitHeight: number;
}

// 默认状态
const state: IState = reactive({
  // 尺寸切换文本
  toggleResizeTxt: EResizeTxt.origin,
  // 图片翻转角度
  rotate: 0,
  // 图片初始尺寸
  imageInitWidth: 0,
  imageInitHeight: 0,
});

// 缩放倍数范围
const maxWidth = 2500;
const minWidth = 200;
const scaleStep = 80;

export default function useToolbar() {
  const { ipcRenderer, IPC_CHANNELS } = window.electron;

  // 设置切换显示大小文本
  const setToggleResizeTxt = (txt: EResizeTxt) => {
    state.toggleResizeTxt = txt;
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

    window.$mediaImageDOM.setAttribute('width', `${naturalWidth}`);
    window.$mediaImageDOM.setAttribute('height', `${naturalHeight}`);

    ipcRenderer.send(IPC_CHANNELS.MEDIA_RESIZE_TO_ORIGIN, {
      naturalWidth,
      naturalHeight,
    });

    adjustOverflow({
      w: naturalWidth,
      h: naturalHeight,
    });
    setToggleResizeTxt(EResizeTxt.fit);
  };

  // 切换到固定尺寸
  const resizeToFit = () => {
    if (!window.$mediaImageDOM) {
      return;
    }
    window.$mediaPreviewerDOM?.classList.remove(originClass);
    window.$mediaImageDOM.classList.remove(overflowClass);

    window.$mediaImageDOM.setAttribute('width', `${state.imageInitWidth}`);
    window.$mediaImageDOM.setAttribute('height', `${state.imageInitHeight}`);

    ipcRenderer.send(IPC_CHANNELS.MEDIA_RESIZE_TO_FIT);

    adjustOverflow({
      w: state.imageInitWidth,
      h: state.imageInitHeight,
    });
    setToggleResizeTxt(EResizeTxt.origin);
  };

  // 窗口最大化切换
  const toggleMaximize = async () => {
    if (!window.$mediaImageDOM) {
      return;
    }

    // 设置图片尺寸
    adjustOverflow({
      w: window.$mediaImageDOM.width,
      h: window.$mediaImageDOM.height,
      fitContain: true,
    });
  };

  // 翻转
  const rotate = () => {
    if (!window.$mediaImageDOM) {
      return;
    }

    state.rotate += 90;
    // 若是90的奇数倍, 则缩小.x倍
    if ((state.rotate / 90) % 2 === 1) {
      window.$mediaImageDOM.style.transform = `rotate(${state.rotate}deg)`;
    } else {
      window.$mediaImageDOM.style.transform = `rotate(${state.rotate}deg)`;
    }

    // 设置图片尺寸
    adjustOverflow({
      w: window.$mediaImageDOM.width,
      h: window.$mediaImageDOM.height,
    });
  };

  // 设置图片适配模式为包含 (即图片能够在预览窗口完整显示)
  const setImageFitContain = (mediaImageDOM: HTMLImageElement, previewerSize: { width: number; height: number }) => {
    console.log('previewerSize', JSON.stringify(previewerSize));
    let w;
    let h;
    // 原图比例
    const ratio = mediaImageDOM.naturalWidth / mediaImageDOM.naturalHeight;

    // 横图: 宽大于高
    if (ratio > 1) {
      const tempW = previewerSize.width;
      const tempH = previewerSize.width / ratio;
      // 若图片缩放后, 高度仍大于容器高度, 则再缩放一次
      if (tempH > previewerSize.height) {
        w = previewerSize.height * ratio;
        h = previewerSize.height;
      } else {
        w = tempW;
        h = tempH;
      }
    }
    // 竖图: 宽小于高
    else {
      const tempW = previewerSize.height * ratio;
      const tempH = previewerSize.height;
      // 若图片缩放后, 宽度仍大于容器宽度, 则再缩放一次
      if (tempW > previewerSize.width) {
        w = previewerSize.width;
        h = previewerSize.width / ratio;
      } else {
        w = tempW;
        h = tempH;
      }
    }

    mediaImageDOM.width = w;
    mediaImageDOM.height = h;

    adjustOverflow({
      w,
      h,
    });

    return { w, h };
  };

  // 设置图片初始化尺寸
  const setImageInitSize = (w: IState['imageInitWidth'], h: IState['imageInitHeight']) => {
    state.imageInitWidth = w;
    state.imageInitHeight = h;

    console.log('image init size', state.imageInitWidth, state.imageInitHeight);
  };

  // 图片按比例缩放尺寸计算
  type TZoom = 'in' | 'out';
  const zoomSize = (mediaImageDOM: HTMLImageElement, zoom: TZoom = 'in') => {
    const ratio = mediaImageDOM.naturalWidth / mediaImageDOM.naturalHeight;
    let w = mediaImageDOM.clientWidth;
    let h = mediaImageDOM.clientHeight;
    // 放大
    if (zoom === 'in') {
      w += scaleStep;
    }
    // 缩小
    else {
      w -= scaleStep;
    }
    h = w / ratio;

    mediaImageDOM.style.display = 'none';
    // 更新图片尺寸
    mediaImageDOM.setAttribute('width', `${w}`);
    mediaImageDOM.setAttribute('height', `${h}`);

    adjustOverflow({
      w,
      h,
    });
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

    zoomSize(window.$mediaImageDOM, 'in');
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

    zoomSize(window.$mediaImageDOM, 'out');
  };

  // 调整图片尺寸溢出样式
  const overflowClass = 'overflow';
  async function adjustOverflow({
    // 图片宽度
    w,
    // 图片高度
    h,
    // 图片适配模式是否为contain
    fitContain = false,
  }: {
    w?: number;
    h?: number;
    fitContain?: boolean;
  }) {
    if (!window.$mediaImageDOM || !window.$mediaPreviewerDOM || !window.$mediaToolbarDOM || !w || !h) {
      return;
    }

    const previewerSize = await ipcRenderer.invoke(IPC_CHANNELS.MEDIA_GET_PREVIEWER_SIZE);
    console.log('previewerSize', JSON.stringify(previewerSize));

    // 是否需要图片尺寸适配预览窗口大小
    if (fitContain) {
      setImageFitContain(window.$mediaImageDOM, { width: w, height: h });
    }

    // 溢出宽度 = 图片宽度 - 预览窗口宽度
    const oWidth = w - previewerSize.width;
    // 溢出高度 = (图片高度 + 工具栏高度) - 预览窗口高度
    const oHeight = h + window.$mediaToolbarDOM.clientHeight - previewerSize.height;

    window.$mediaImageDOM.style.left = `${-oWidth / 2}px`;
    window.$mediaImageDOM.style.top = `${-oHeight / 2}px`;

    // 图片尺寸是否超出窗口
    if (oWidth || oHeight) {
      window.$mediaImageDOM.classList.add(overflowClass);
    } else {
      window.$mediaImageDOM.classList.remove(overflowClass);
    }

    window.$mediaImageDOM.style.display = 'block';
  }

  // 下载
  let lastDownloadClickTime = 0;
  const downloadClickInterval = 3000;
  const downloadURI = (media: IMediaItem) => {
    if (!media.url) {
      message.warn('缺少下载资源', 1);
      return;
    }
    const curDownloadClickTime = new Date().getTime();
    // 防止短时间(毫秒)内多次点击下载
    if (curDownloadClickTime - lastDownloadClickTime < downloadClickInterval) {
      return;
    }
    lastDownloadClickTime = new Date().getTime();
    ipcRenderer.send(IPC_CHANNELS.MEDIA_DOWNLOAD, {
      type: media.type,
      uri: media.url,
    });
  };

  // 复制文件
  const copyFile = (media: IMediaItem) => {
    ipcRenderer.send(IPC_CHANNELS.MEDIA_COPY_FILE, {
      type: media.type,
      uri: media.url,
    });
  };

  // 转发
  const forward = (media: IMediaItem) => {
    // NOTE: 不能直接在IPC通信中传递ref对象
    // NOTE: Sending non-standard JavaScript types such as DOM objects or special Electron objects will throw an exception.
    // https://www.electronjs.org/docs/latest/api/ipc-renderer/#ipcrenderersendchannel-args
    ipcRenderer.send(IPC_CHANNELS.MEDIA_FORWARD, {
      ...media,
    });
  };

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
    toggleMaximize,
    rotate,
    setImageFitContain,
    setImageInitSize,
    zoomIn,
    zoomOut,
    adjustOverflow,
    downloadURI,
    copyFile,
    forward,
    reset,
  };
}
