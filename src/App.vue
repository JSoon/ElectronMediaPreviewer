<template>
  <Toolbar @fullscreen="toggleFullscreen" />
  <MediaPreviewer ref="comMediaPreviewer" :index="index" :media="media" :mediaList="mediaList" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Toolbar from '@/components/Toolbar.vue';
import MediaPreviewer from '@/components/MediaPreviewer.vue';
import { IMediaData, IMediaItem } from '@/typings/media';
import useShortcuts from '@/composables/useShortcuts';
import useFullscreen from '@/composables/useFullscreen';

export default defineComponent({
  name: 'App',
  components: {
    Toolbar,
    MediaPreviewer,
  },
  data() {
    return {};
  },
  setup() {
    const index = ref(0);
    const media = ref<IMediaItem>();
    const mediaList = ref<IMediaItem[]>();

    const comMediaPreviewer = ref<InstanceType<typeof MediaPreviewer>>();
    const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

    const { ipcRenderer, IPC_CHANNELS } = window.electron;
    ipcRenderer.on(IPC_CHANNELS.MEDIA_PREVIEW, (e: any, data: IMediaData) => {
      console.log(data);
      index.value = data.index;
      media.value = data.media;
      mediaList.value = data.mediaList;
    });

    onMounted(useShortcuts);

    return {
      index,
      media,
      mediaList,

      comMediaPreviewer,
      isFullscreen,
      enterFullscreen,
      exitFullscreen,
    };
  },
  methods: {
    // 全屏切换
    toggleFullscreen() {
      const previewer = this.comMediaPreviewer?.$el;
      if (!previewer) {
        return;
      }
      // 若当前是全屏则退出全屏, 否则进入全屏
      if (this.isFullscreen) {
        this.exitFullscreen();
      } else {
        this.enterFullscreen(previewer);
      }
    },
  },
});
</script>

<style lang="less">
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  user-select: none;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

img {
  -webkit-user-drag: none;
}
</style>
