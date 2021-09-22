<template>
  <Toolbar />
  <MediaPreviewer />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import Toolbar from '@/components/Toolbar.vue';
import MediaPreviewer from '@/components/MediaPreviewer.vue';
import useShortcuts from '@/composables/useShortcuts';

export default defineComponent({
  name: 'App',
  components: {
    Toolbar,
    MediaPreviewer,
  },
  data() {
    return {};
  },
  setup() {
    // 快捷键注册
    onMounted(useShortcuts);
  },
});
</script>

<style lang="less">
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  user-select: none;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

img {
  -webkit-user-drag: none;
}
</style>
