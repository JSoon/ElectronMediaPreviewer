<template>
  <div class="com-toolbar">
    <div class="group">
      <button @click="onPrev">上一页</button>
      <button @click="onNext">下一页</button>
    </div>
    <div class="group">
      <button>放大</button>
      <button>缩小</button>
      <button>翻转</button>
      <button @click="toggleSize">1:1</button>
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
import { defineComponent } from 'vue';
import useMediaData from '@/composables/useMediaData';
import useFullscreen from '@/composables/useFullscreen';
import useToolbar from '@/composables/useToolbar';

export default defineComponent({
  setup() {
    const { onPrev, onNext } = useMediaData();
    const { toggleFullscreen } = useFullscreen();
    const { toggleSize } = useToolbar();

    // 关闭预览
    const closePreviewer = () => {
      window.close();
    };

    return {
      onPrev,
      onNext,
      closePreviewer,
      toggleFullscreen,
      toggleSize,
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
