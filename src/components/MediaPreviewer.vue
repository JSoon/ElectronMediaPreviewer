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
          @load="onMediaImageLoaded"
        />
        <video
          v-if="isMediaVideo"
          :key="media.id"
          class="media-item"
          :class="mediaClass"
          controls
          controlslist="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          ref="mediaVideoDOM"
          autoplay="autoplay"
          muted
        >
          <source :src="media.url" type="video/mp4" />
          Sorry, your browser doesn't support embedded videos.
        </video>
        <template #overlay>
          <ContextMenu />
        </template>
      </a-dropdown>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, onBeforeUpdate, nextTick } from 'vue';
import { EMediaType } from '@/typings/media';
import useMediaData from '@/composables/useMediaData';
import useToolbar from '@/composables/useToolbar';
import ContextMenu from '@/components/ContextMenu.vue';

// 处理图片拖拽移动事件
function handleImageMove(mediaImageDOM: HTMLImageElement) {
  let isKeydown = false;
  let originCoords = { x: 0, y: 0 };

  mediaImageDOM.addEventListener('mousedown', onMediaImageMouseDown);
  mediaImageDOM.addEventListener('mouseup', onMediaImageMouseUp);
  mediaImageDOM.addEventListener('mouseleave', onMediaImageMouseLeave);

  function onMediaImageMouseDown(e: MouseEvent) {
    isKeydown = true;
    originCoords.x = e.x;
    originCoords.y = e.y;

    mediaImageDOM.addEventListener('mousemove', onMediaImageMouseMove);
  }

  function onMediaImageMouseMove(e: MouseEvent) {
    if (!isKeydown) {
      return;
    }
    // 计算坐标移动值
    const diffCoords = {
      x: e.x - originCoords.x,
      y: e.y - originCoords.y,
    };
    // 更新图片位置坐标
    const left = parseFloat(mediaImageDOM.style.left) + diffCoords.x;
    const top = parseFloat(mediaImageDOM.style.top) + diffCoords.y;
    mediaImageDOM.style.left = `${left}px`;
    mediaImageDOM.style.top = `${top}px`;

    // 更新初始坐标
    originCoords.x = e.x;
    originCoords.y = e.y;
  }

  function onMediaImageMouseUp(e: MouseEvent) {
    isKeydown = false;

    mediaImageDOM.removeEventListener('mousemove', onMediaImageMouseMove);
  }

  // 鼠标移出预览区域时, 注销图片移动事件
  function onMediaImageMouseLeave(e: MouseEvent) {
    console.log('鼠标移出预览图');

    isKeydown = false;
    mediaImageDOM.removeEventListener('mousemove', onMediaImageMouseMove);
  }
}

export default defineComponent({
  components: {
    ContextMenu,
  },
  setup() {
    const { media } = useMediaData();
    const { setImageFitContain, setImageInitSize, adjustOverflow } = useToolbar();

    const isMediaImage = computed(() => media.value?.type === EMediaType.IMG);
    const isMediaVideo = computed(() => media.value?.type === EMediaType.VIDEO);

    const mediaClass = computed(() => {
      return media.value?.type === EMediaType.IMG ? 'media-image' : 'media-video';
    });

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
    const onMediaImageLoaded = function () {
      const { w, h } = setImageFitContain(mediaImageDOM.value, {
        width: mediaPreviewerDOM.value.offsetWidth,
        height: mediaPreviewerDOM.value.offsetHeight,
      });
      setImageInitSize(w, h);
      handleImageMove(mediaImageDOM.value);

      // 窗口缩放, 调节图片位置
      window.addEventListener('resize', () => {
        adjustOverflow({
          w: mediaImageDOM.value.width,
          h: mediaImageDOM.value.height,
        });
      });
    };

    return {
      media,
      isMediaImage,
      isMediaVideo,
      mediaClass,
      onMediaImageLoaded,

      mediaPreviewerDOM,
      mediaImageDOM,
      mediaVideoDOM,
    };
  },
});
</script>

<style lang="less" scoped>
.com-media-previewer::v-deep {
  z-index: 1;
  position: fixed;
  top: 38px;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  background-color: #eee;

  .media-item {
    position: absolute;
    top: 0;
    left: 0;
    -webkit-user-select: none;
    user-select: none;
    -webkit-app-region: no-drag;
  }

  // 视频由于无法隐藏更多菜单按钮，且无伪类能够控制其no-drag属性，故视频整个禁用拖拽
  video::-webkit-media-controls-panel {
    -webkit-app-region: no-drag;
  }

  .media-image {
    // transition: all 0.3s;

    &.overflow {
      // position: relative;
    }
  }

  .media-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
