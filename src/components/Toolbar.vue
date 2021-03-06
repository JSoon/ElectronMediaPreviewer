<template>
  <div class="com-toolbar" ref="mediaToolbarDOM" @dblclick.self="toggleFullscreen">
    <div class="group">
      <a-tooltip title="上一张">
        <button :disabled="!hasPrev" @click="turnToPrev"><i class="iconfont icon-web-pl-arrow" /></button>
      </a-tooltip>
      <a-tooltip title="下一张">
        <button :disabled="!hasNext" @click="turnToNext"><i class="iconfont icon-web-pr-arrow" /></button>
      </a-tooltip>
    </div>
    <div class="group">
      <a-tooltip title="放大">
        <button :disabled="isMediaVideo" @click="() => zoomIn()">
          <i class="iconfont icon-web-enlarge" />
        </button>
      </a-tooltip>
      <a-tooltip title="缩小">
        <button :disabled="isMediaVideo" @click="() => zoomOut()">
          <i class="iconfont icon-web-narrow" />
        </button>
      </a-tooltip>
      <a-tooltip title="旋转">
        <button :disabled="isMediaVideo" @click="rotate">
          <i class="iconfont icon-web-rotate" />
        </button>
      </a-tooltip>
      <a-tooltip :title="toggleResizeTxt">
        <button :disabled="isMediaVideo" @click="toggleSize">
          <i v-if="toggleResizeTxt === EResizeTxt.origin" class="iconfont icon-web-size" />
          <i v-if="toggleResizeTxt === EResizeTxt.fit" class="iconfont icon-web-default" />
        </button>
      </a-tooltip>
    </div>
    <div class="group">
      <a-dropdown :trigger="['click']">
        <template #overlay>
          <ContextMenu />
        </template>
        <a-button type="link"><i class="iconfont icon-web-icon-more" /></a-button>
      </a-dropdown>
    </div>
    <div class="window-actions">
      <a-tooltip :title="isFullscreen ? '还原' : '最大化'">
        <button v-if="!isFullscreen" @click="toggleFullscreen"><i class="iconfont icon-web-maximize" /></button>
        <button v-else @click="toggleFullscreen"><i class="iconfont icon-web-minimize" /></button>
      </a-tooltip>
      <a-tooltip title="关闭">
        <button @click="closePreviewer"><i class="iconfont icon-web-close" /></button>
      </a-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import useMediaData from '@/composables/useMediaData';
import useFullscreen from '@/composables/useFullscreen';
import useToolbar, { EResizeTxt } from '@/composables/useToolbar';
import { EMediaType } from '@/typings/media';
import ContextMenu from '@/components/ContextMenu.vue';

export default defineComponent({
  components: {
    ContextMenu,
  },
  setup() {
    const { media, turnToPrev, turnToNext, hasPrev, hasNext } = useMediaData();
    const { isFullscreen, toggleFullscreen } = useFullscreen();
    const { toggleSize, toggleResizeTxt, rotate, zoomIn, zoomOut } = useToolbar();

    const isMediaVideo = computed(() => media.value?.type === EMediaType.VIDEO);

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
      hasPrev,
      hasNext,

      closePreviewer,
      isFullscreen,
      toggleFullscreen,
      toggleSize,
      EResizeTxt,
      toggleResizeTxt,
      rotate,
      zoomIn,
      zoomOut,
    };
  },
});
</script>

<style lang="less" scoped>
.com-toolbar {
  z-index: 2;
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
    padding: 0 5px;
    -webkit-app-region: no-drag;
    border: none;
    background: none;
    color: #333;
    cursor: initial;

    &:disabled {
      color: #ccc;
    }
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

    .icon-web-maximize,
    .icon-web-minimize {
      font-size: 13px;
    }

    .icon-web-close {
      font-size: 12px;
    }
  }
}
</style>
