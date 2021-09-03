<template>
  <MediaPreviewer :index="index" :media="media" :mediaList="mediaList" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import MediaPreviewer from '@/components/MediaPreviewer.vue';
import { IMediaData, IMediaItem } from '@/typings/media';

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

    return {
      index,
      media,
      mediaList,
    };
  },
});
</script>

<style lang="less">
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
