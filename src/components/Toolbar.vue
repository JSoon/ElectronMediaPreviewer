<template>
  <div class="com-toolbar" ref="mediaToolbarDOM">
    <div class="group">
      <button @click="turnToPrev"><i class="iconfont icon-web-pl-arrow" /></button>
      <button @click="turnToNext"><i class="iconfont icon-web-pr-arrow" /></button>
    </div>
    <div class="group">
      <button :disabled="isMediaVideo" @click="zoomIn">
        <i class="iconfont icon-web-enlarge" />
      </button>
      <button :disabled="isMediaVideo" @click="zoomOut">
        <i class="iconfont icon-web-narrow" />
      </button>
      <button :disabled="isMediaVideo" @click="rotate">
        <i class="iconfont icon-web-rotate" />
      </button>
      <button :disabled="isMediaVideo" @click="toggleSize">
        <i v-if="toggleResizeTxt === EResizeTxt.origin" class="iconfont icon-web-size" />
        <i v-if="toggleResizeTxt === EResizeTxt.fit" class="iconfont icon-web-default" />
      </button>
      <!-- <button
        @click="
          () => {
            downloadURI(media.url);
          }
        "
      >
        下载
      </button> -->
    </div>
    <div class="group">
      <button><i class="iconfont icon-web-icon-more" /></button>
    </div>
    <div class="window-actions">
      <button @click="toggleFullscreen"><i class="iconfont icon-web-zoom-large" /></button>
      <button @click="closePreviewer"><i class="iconfont icon-web-close" /></button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import useMediaData from '@/composables/useMediaData';
import useFullscreen from '@/composables/useFullscreen';
import useToolbar, { EResizeTxt } from '@/composables/useToolbar';
import { EMediaType } from '@/typings/media';

export default defineComponent({
  setup() {
    const { media, turnToPrev, turnToNext } = useMediaData();
    const isMediaVideo = computed(() => media.value?.type === EMediaType.VIDEO);

    const { toggleFullscreen } = useFullscreen();
    const { toggleSize, toggleResizeTxt, rotate, zoomIn, zoomOut, downloadURI } = useToolbar();

    const mediaToolbarDOM = ref(null);
    onMounted(() => (window.$mediaToolbarDOM = mediaToolbarDOM.value));

    // 关闭预览
    const closePreviewer = () => {
      window.close();
    };

    return {
      mediaToolbarDOM,
      media,
      isMediaVideo,
      turnToPrev,
      turnToNext,

      closePreviewer,
      toggleFullscreen,
      toggleSize,
      EResizeTxt,
      toggleResizeTxt,
      rotate,
      zoomIn,
      zoomOut,
      downloadURI,
    };
  },
});
</script>

<style lang="less" scoped>
.com-toolbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 38px;

  button {
    margin: 0 5px;
    -webkit-app-region: no-drag;
    border: none;
    background: none;
  }

  .group {
    position: relative;
    padding: 0 10px;

    &:first-child {
      &::before {
        display: none;
      }
    }

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      display: block;
      border-left: 1px solid #eee;
      width: 1px;
      height: 20px;
    }
  }

  .window-actions {
    position: absolute;
    right: 5px;

    .iconfont {
      font-size: 12px;
    }
  }
}
</style>
