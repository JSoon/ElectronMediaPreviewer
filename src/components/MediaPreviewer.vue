<template>
  <div class="com-media-previewer">
    <template v-if="media">
      <img v-if="isMediaImage" class="media-item" :class="mediaClass" :src="media.url" alt="xxx" />
      <video v-if="isMediaVideo" class="media-item" :class="mediaClass" controls>
        <source :src="media.url" type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
    </template>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, computed } from 'vue';
import { IMediaItem, EMediaType } from '@/typings/media';

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

    return {
      isMediaImage,
      isMediaVideo,
      mediaClass,
    };
  },
});
</script>

<style lang="less" scoped>
.com-media-previewer::v-deep {
  position: fixed;
  top: 0;
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
}
</style>
