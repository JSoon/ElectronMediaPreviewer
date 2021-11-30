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

// 处理鼠标滚动缩放图片
function handleMouseWheel(DOM: HTMLElement, zoomIn: (rate: number) => void, zoomOut: (rate: number) => void) {
  DOM.addEventListener('wheel', (e) => {
    e.preventDefault();
    const isZoomIn = e.deltaY < 0 ? true : false;
    const scaleRate = Math.min(Math.abs(e.deltaY / 100), 0.3);
    // 放大
    if (isZoomIn) {
      zoomIn(scaleRate);
    }
    // 缩小
    else {
      zoomOut(scaleRate);
    }
  });
}

// 图片是否溢出预览窗口
function imageOverflow(mediaImageDOM: HTMLImageElement) {
  return {
    overflow: mediaImageDOM.classList.contains('overflow'),
    overflowX: mediaImageDOM.classList.contains('overflow-x'),
    overflowY: mediaImageDOM.classList.contains('overflow-y'),
  };
}

// 处理图片拖拽移动事件
function handleImageMove(mediaImageDOM: HTMLImageElement, mediaPreviewerDOM: HTMLDivElement) {
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
    const { overflowX, overflowY } = imageOverflow(mediaImageDOM);

    // 计算坐标移动值
    const diffCoords = {
      x: e.x - originCoords.x,
      y: e.y - originCoords.y,
    };
    // 更新图片位置坐标
    const left = parseFloat(mediaImageDOM.style.left) + diffCoords.x;
    const top = parseFloat(mediaImageDOM.style.top) + diffCoords.y;

    let finalLeft = left;
    let finalTop = top;
    // 限制图片可拖动边界 (暂时不做限制, 因为图片旋转后, 宽高并不会发生变化, 会导致拖拽后显示不完整)
    // if (left < 0) {
    //   if (left > mediaPreviewerDOM.clientWidth - mediaImageDOM.clientWidth) {
    //     finalLeft = left;
    //   } else {
    //     finalLeft = mediaPreviewerDOM.clientWidth - mediaImageDOM.clientWidth;
    //   }
    // } else {
    //   finalLeft = 0;
    // }
    // if (top < 0) {
    //   if (top > mediaPreviewerDOM.clientHeight - mediaImageDOM.clientHeight) {
    //     finalTop = top;
    //   } else {
    //     finalTop = mediaPreviewerDOM.clientHeight - mediaImageDOM.clientHeight;
    //   }
    // } else {
    //   finalTop = 0;
    // }

    // 更新图片位置
    if (overflowX) {
      mediaImageDOM.style.left = `${finalLeft}px`;
    }
    if (overflowY) {
      mediaImageDOM.style.top = `${finalTop}px`;
    }

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
    const { setImageFitContain, setImageInitSize, adjustImage, zoomIn, zoomOut, reset } = useToolbar();

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
        // 若是视频, 则获取焦点
        window.$mediaVideoDOM?.focus();
        // 初始化状态
        reset();
      });
    });

    // 初始化图片尺寸
    const onMediaImageLoaded = function () {
      const { w, h } = setImageFitContain(mediaImageDOM.value, {
        width: mediaPreviewerDOM.value.offsetWidth,
        height: mediaPreviewerDOM.value.offsetHeight,
      });
      setImageInitSize(w, h);
      mediaImageDOM.value.style.display = 'block';
      handleImageMove(mediaImageDOM.value, mediaPreviewerDOM.value);
      handleMouseWheel(mediaPreviewerDOM.value, zoomIn, zoomOut);
      handleMouseWheel(mediaImageDOM.value, zoomIn, zoomOut);

      // 窗口缩放, 调节图片位置
      window.addEventListener('resize', () => {
        adjustImage({
          changeSize: false,
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
  -webkit-app-region: no-drag;

  .media-item {
    position: absolute;
    top: 0;
    left: 0;
  }

  // 视频由于无法隐藏更多菜单按钮，且无伪类能够控制其no-drag属性，故视频整个禁用拖拽
  video::-webkit-media-controls-panel {
    -webkit-app-region: no-drag;
  }

  .media-image {
    display: block;
    // transition: all 0.3s;

    &.overflow {
      cursor: move;
    }
  }

  .media-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .zoom-toast {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px 20px;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 20px;
    color: #fff;
    pointer-events: none;
  }
}
</style>
