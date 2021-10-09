<template>
  <div class="com-media-previewer" ref="mediaPreviewerDOM">
    <template v-if="media">
      <a-dropdown :trigger="['contextmenu']">
        <img
          v-if="isMediaImage"
          :key="media.id"
          class="media-item"
          :class="mediaClass"
          :src="media.url"
          alt=""
          ref="mediaImageDOM"
          :width="mediaImageWidth"
          :height="mediaImageHeight"
          @load="onMediaImageLoaded"
        />
        <video
          v-if="isMediaVideo"
          :key="media.id"
          class="media-item video-item"
          :class="mediaClass"
          controls
          controlslist="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          ref="mediaVideoDOM"
        >
          <source :src="media.url" type="video/mp4" />
          Sorry, your browser doesn't support embedded videos.
        </video>
        <template #overlay>
          <ContextMenu />
        </template>
      </a-dropdown>
    </template>

    <div v-if="isFullscreen" class="fullscreen-actions">
      <button @click="closePreviewer"><i class="iconfont icon-web-close" /></button>
      <button @click="exitFullscreen"><i class="iconfont icon-web-minimize" /></button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, onBeforeUpdate, nextTick } from 'vue';
import { EMediaType } from '@/typings/media';
import useMediaData from '@/composables/useMediaData';
import useToolbar from '@/composables/useToolbar';
import useFullscreen from '@/composables/useFullscreen';
import ContextMenu from '@/components/ContextMenu.vue';

export default defineComponent({
  components: {
    ContextMenu,
  },
  setup() {
    const { media } = useMediaData();
    const { setImageInitSize } = useToolbar();

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
    const mediaPreviewerDOM = ref();
    onMounted(() => {
      window.$mediaPreviewerDOM = mediaPreviewerDOM.value;
    });

    // 单个媒体组件DOM全局变量注册
    const mediaImageDOM = ref();
    const mediaVideoDOM = ref();
    // 动态ref注册
    // 1. 数据变化
    onBeforeUpdate(() => {
      // 2. DOM完成渲染
      nextTick(() => {
        window.$mediaImageDOM = mediaImageDOM.value;
        window.$mediaVideoDOM = mediaVideoDOM.value;
      });
    });

    // 初始化图片尺寸
    const mediaImageWidth = ref();
    const mediaImageHeight = ref();
    const onMediaImageLoaded = function () {
      let w;
      let h;
      // 原图比例
      const ratio = mediaImageDOM.value.naturalWidth / mediaImageDOM.value.naturalHeight;
      // 若是横图
      if (ratio >= 1) {
        const tempW = mediaPreviewerDOM.value.offsetWidth;
        const tempH = mediaPreviewerDOM.value.offsetWidth / ratio;
        // 若图片缩放后, 高度仍大于容器高度, 则再缩放一次
        if (tempH > mediaPreviewerDOM.value.offsetHeight) {
          w = null;
          h = mediaPreviewerDOM.value.offsetHeight;
        } else {
          w = tempW;
          h = null;
        }
      }
      // 若是竖图
      else {
        w = null;
        h = mediaPreviewerDOM.value.offsetHeight;
      }
      mediaImageWidth.value = w;
      mediaImageHeight.value = h;
      setImageInitSize(w, h);
    };

    return {
      media,
      isMediaImage,
      isMediaVideo,
      mediaClass,
      onMediaImageLoaded,
      mediaImageWidth,
      mediaImageHeight,

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

  &.fullscreen {
    background-color: #000;

    .media-image {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 90%;
      height: 90%;
      margin: auto;
      object-fit: contain;
    }
  }

  .media-item {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
  }

  // 视频由于无法隐藏更多菜单按钮，且无伪类能够控制其no-drag属性，故视频整个禁用拖拽
  video::-webkit-media-controls-panel {
    -webkit-app-region: no-drag;
  }

  .media-image {
    transition: all 0.3s;

    &.overflow {
      position: relative;
    }
  }

  .media-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .fullscreen-actions {
    position: fixed;
    top: 30px;
    left: 30px;
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 12px;
    background: #1d1d1d;
    border-radius: 6px;
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }

    button {
      padding: 15px;
      border: none;
      background: none;
      -webkit-app-region: no-drag;
    }

    .iconfont {
      color: #d2d2d2;
    }

    .icon-web-close {
      font-size: 20px;
    }

    .icon-web-minimize {
      font-size: 25px;
    }
  }
}
</style>
