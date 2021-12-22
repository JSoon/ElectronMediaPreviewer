import { toRefs, reactive } from 'vue';
import { IMediaData } from '@/typings/media';
import { message } from 'ant-design-vue';

interface IState extends IMediaData {
  hasPrev: boolean;
  hasNext: boolean;
}

// 默认状态
const state: IState = reactive({
  index: 0,
  media: null,
  mediaList: [],
  hasPrev: false,
  hasNext: false,
});

// 数据初始化
const { ipcRenderer, IPC_CHANNELS } = window.electron;
ipcRenderer.on(IPC_CHANNELS.MEDIA_PREVIEW, (e: any, data: IMediaData) => {
  console.log('数据初始化', data);
  state.index = data.index;
  state.media = data.media;
  state.mediaList = data.mediaList;
  updatePagerState(state);
});

// 更新分页器状态
function updatePagerState(state: IState) {
  // 预览数据仅有一条
  if (state.mediaList.length <= 1) {
    state.hasPrev = false;
    state.hasNext = false;
    return;
  }
  // 预览数据不止一条
  if (state.index === 0) {
    state.hasPrev = false;
    state.hasNext = true;
  } else if (state.index > 0 && state.index < state.mediaList.length - 1) {
    state.hasPrev = true;
    state.hasNext = true;
  } else {
    state.hasPrev = true;
    state.hasNext = false;
  }
}

export default function useMediaData() {
  // 上一张
  const turnToPrev = () => {
    if (state.index === 0) {
      message.info({
        content: '已经是第一张了',
        duration: 1,
        key: 'turnToPrev',
      });
      return;
    }
    state.index -= 1;
    state.media = state.mediaList[state.index];
    updatePagerState(state);
  };

  // 下一张
  const turnToNext = () => {
    if (state.index === state.mediaList.length - 1) {
      message.info({
        content: '已经是最后一张了',
        duration: 1,
        key: 'turnToNext',
      });
      return;
    }
    state.index += 1;
    state.media = state.mediaList[state.index];
    updatePagerState(state);
  };

  return {
    ...toRefs(state),
    turnToPrev,
    turnToNext,
  };
}
