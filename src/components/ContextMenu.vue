<template>
  <a-menu>
    <a-menu-item key="1" @click="onCopy">复制</a-menu-item>
    <a-menu-item key="2">转发</a-menu-item>
    <a-menu-item key="3" @click="onDownload">另存为</a-menu-item>
  </a-menu>
</template>

<script lang="ts">
import useMediaData from '@/composables/useMediaData';
import useToolbar from '@/composables/useToolbar';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const { media } = useMediaData();

    const { downloadURI, copyFile } = useToolbar();

    // 下载另存为
    const onDownload = () => {
      if (!media.value) {
        return;
      }
      downloadURI(media.value.url);
    };

    // 复制文件
    const onCopy = () => {
      if (!media.value) {
        return;
      }
      copyFile(media.value.url);
    };

    return {
      onDownload,
      downloadURI,
      onCopy,
    };
  },
});
</script>

<style></style>
