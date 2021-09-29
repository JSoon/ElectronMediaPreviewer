<template>
  <a-menu>
    <a-menu-item key="1" @click="onCopy" v-if="isMediaImage">复制</a-menu-item>
    <a-menu-item key="2" @click="onForward">转发</a-menu-item>
    <a-menu-item key="3" @click="onDownload">另存为</a-menu-item>
  </a-menu>
</template>

<script lang="ts">
import useMediaData from '@/composables/useMediaData';
import useToolbar from '@/composables/useToolbar';
import { EMediaType } from '@/typings/media';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const { media } = useMediaData();

    const isMediaImage = computed(() => media.value?.type === EMediaType.IMG);

    const { downloadURI, copyFile, forward } = useToolbar();

    // 下载另存为
    const onDownload = () => {
      if (!media.value) {
        return;
      }
      downloadURI(media.value);
    };

    // 复制文件
    const onCopy = () => {
      if (!media.value) {
        return;
      }
      copyFile(media.value);
    };

    // 转发
    const onForward = () => {
      if (!media.value) {
        return;
      }
      forward(media.value);
    };

    return {
      isMediaImage,
      onDownload,
      downloadURI,
      onCopy,
      onForward,
    };
  },
});
</script>

<style></style>
