<template>
  <div class="com-media-previewer">
    <template v-if="media">
      <img v-if="isMediaImage" class="media-item" :class="mediaClass" :src="media.url" alt="xxx" />
      <video v-if="isMediaVideo" class="media-item" :class="mediaClass" controls>
        <source :src="media.url" type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
    </template>

    <div v-if="isFullscreen" class="fullscreen-actions">
      <button @click="closePreviewer">关闭预览</button>
      <button @click="exitFullscreen">退出全屏</button>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, computed, watch } from 'vue';
import { IMediaItem, EMediaType } from '@/typings/media';
import useFullscreen from '@/composables/useFullscreen';

export default defineComponent({
  props: {
    index: {
      type: Number,
    },
    media: {
      type: Object as PropType<IMediaItem>,
    },
    mediaList: {
      type: Array as PropType<IMediaItem[]>,
    },
  },
  setup(props) {
    console.log('props', props);

    const isMediaImage = computed(() => props.media?.type === EMediaType.IMG);
    const isMediaVideo = computed(() => props.media?.type === EMediaType.VIDEO);

    const mediaClass = computed(() => {
      return props.media?.type === EMediaType.IMG ? 'media-image' : 'media-video';
    });

    const { isFullscreen, exitFullscreen } = useFullscreen();
    watch(isFullscreen, (val) => {
      if (val) {
        console.log('当前是全屏');
      } else {
        console.log('当前是非全屏');
      }
    });
    // 关闭预览
    const closePreviewer = () => {
      window.close();
    };

    return {
      isMediaImage,
      isMediaVideo,
      mediaClass,

      isFullscreen,
      exitFullscreen,
      closePreviewer,
    };
  },
});
</script>

<style lang="less" scoped>
.com-media-previewer::v-deep {
  position: fixed;
  top: 38px;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eee;

  .media-item {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .fullscreen-actions {
    position: absolute;
    top: 10px;
    left: 10px;
  }
}
</style>
