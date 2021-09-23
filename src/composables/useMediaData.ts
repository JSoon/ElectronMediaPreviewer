import { toRefs, reactive } from 'vue';
import { IMediaData } from '@/typings/media';
import useToolbar from './useToolbar';
import { message } from 'ant-design-vue';

// 默认状态
const state: IMediaData = reactive({
  index: 0,
  media: null,
  mediaList: [],
});

// 数据初始化
const { ipcRenderer, IPC_CHANNELS } = window.electron;
ipcRenderer.on(IPC_CHANNELS.MEDIA_PREVIEW, (e: any, data: IMediaData) => {
  console.log('数据初始化', data);
  state.index = data.index;
  state.media = data.media;
  state.mediaList = data.mediaList;
});

export default function useMediaData() {
  const { reset } = useToolbar();

  // 上一张
  const turnToPrev = () => {
    if (state.index === 0) {
      message.info('已经是第一张了', 1);
      return;
    }
    state.index -= 1;
    state.media = state.mediaList[state.index];
    reset();
  };

  // 下一张
  const turnToNext = () => {
    if (state.index === state.mediaList.length - 1) {
      message.info('已经是最后一张了', 1);
      return;
    }
    state.index += 1;
    state.media = state.mediaList[state.index];
    reset();
  };

  return {
    ...toRefs(state),
    turnToPrev,
    turnToNext,
  };
}
