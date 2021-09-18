<template>
  <MediaPreviewer :index="index" :media="media" :mediaList="mediaList" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import MediaPreviewer from '@/components/MediaPreviewer.vue';
import { IMediaData, IMediaItem } from '@/typings/media';
import useShortcuts from '@/utils/useShortcuts';

export default defineComponent({
  name: 'App',
  components: {
    MediaPreviewer,
  },
  data() {
    return {};
  },
  setup() {
    const index = ref(0);
    const media = ref<IMediaItem>();
    const mediaList = ref<IMediaItem[]>();

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
    };
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
  transition: 0.5s opacity;

  &.fade-out {
    opacity: 0;
  }
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
