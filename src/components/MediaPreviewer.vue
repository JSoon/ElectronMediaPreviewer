<template>
  <div class="com-media-previewer" ref="mediaPreviewerDOM">
    <template v-if="media">
      <img v-if="isMediaImage" class="media-item" :class="mediaClass" :src="media.url" alt="xxx" ref="mediaImageDOM" />
      <video v-if="isMediaVideo" class="media-item" :class="mediaClass" controls ref="mediaVideoDOM">
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
import { defineComponent, computed, onMounted, ref, onBeforeUpdate, nextTick } from 'vue';
import { EMediaType } from '@/typings/media';
import useMediaData from '@/composables/useMediaData';
import useFullscreen from '@/composables/useFullscreen';

export default defineComponent({
  setup() {
    const { media } = useMediaData();

    const isMediaImage = computed(() => media.value?.type === EMediaType.IMG);
    const isMediaVideo = computed(() => media.value?.type === EMediaType.VIDEO);

    const mediaClass = computed(() => {
      return media.value?.type === EMediaType.IMG ? 'media-image' : 'media-video';
    });

    const { isFullscreen, exitFullscreen } = useFullscreen();
    // 关闭预览
    const closePreviewer = () => {
      window.close();
    };

    // 预览组件DOM全局变量注册
    const mediaPreviewerDOM = ref(null);
    onMounted(() => (window.$mediaPreviewerDOM = mediaPreviewerDOM.value));

    // 单个媒体组件DOM全局变量注册
    const mediaImageDOM = ref(null);
    const mediaVideoDOM = ref(null);
    // 动态ref注册
    // 1. 数据变化
    onBeforeUpdate(() => {
      // 2. DOM完成渲染
      nextTick(() => {
        window.$mediaImageDOM = mediaImageDOM.value;
        window.$mediaVideoDOM = mediaVideoDOM.value;
      });
    });

    return {
      media,
      isMediaImage,
      isMediaVideo,
      mediaClass,

      mediaPreviewerDOM,
      mediaImageDOM,
      mediaVideoDOM,
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
  overflow: auto;
  background-color: #eee;

  .media-item {
    display: block;
    width: 100%;
    height: 100%;
    margin: auto;
    object-fit: contain;
  }

  .media-image {
    &.origin-size {
      width: auto;
      height: auto;
      object-fit: none;
    }
  }

  .fullscreen-actions {
    position: absolute;
    top: 10px;
    left: 10px;
  }
}
</style>
