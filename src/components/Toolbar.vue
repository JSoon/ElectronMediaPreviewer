<template>
  <div class="com-toolbar" ref="mediaToolbarDOM">
    <div class="group">
      <button @click="onPrev">上一页</button>
      <button @click="onNext">下一页</button>
    </div>
    <div class="group">
      <button :disabled="isMediaVideo">放大</button>
      <button :disabled="isMediaVideo">缩小</button>
      <button :disabled="isMediaVideo">翻转</button>
      <button :disabled="isMediaVideo" @click="toggleSize">{{ txtToggleResize }}</button>
      <button>下载</button>
    </div>
    <div class="group">
      <button>更多</button>
    </div>
    <div class="window-actions">
      <button @click="toggleFullscreen">最大化</button>
      <button @click="closePreviewer">关闭</button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import useMediaData from '@/composables/useMediaData';
import useFullscreen from '@/composables/useFullscreen';
import useToolbar from '@/composables/useToolbar';
import { EMediaType } from '@/typings/media';

export default defineComponent({
  setup() {
    const { media, onPrev, onNext } = useMediaData();
    const isMediaVideo = computed(() => media.value?.type === EMediaType.VIDEO);

    const { toggleFullscreen } = useFullscreen();
    const { toggleSize, txtToggleResize } = useToolbar();

    const mediaToolbarDOM = ref(null);
    onMounted(() => (window.$mediaToolbarDOM = mediaToolbarDOM.value));

    // 关闭预览
    const closePreviewer = () => {
      window.close();
    };

    return {
      mediaToolbarDOM,
      isMediaVideo,
      onPrev,
      onNext,
      closePreviewer,
      toggleFullscreen,
      toggleSize,
      txtToggleResize,
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
  }

  .group {
    margin: 0 10px;
  }

  .window-actions {
    position: absolute;
    right: 0;
  }
}
</style>
