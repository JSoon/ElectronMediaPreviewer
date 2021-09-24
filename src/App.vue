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
* {
  box-sizing: border-box;
}

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
  height: 100%;
  overflow: auto;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

img {
  -webkit-user-drag: none;
}

button {
  outline-width: 0;
}

.iconfont {
  font-family: 'iconfont-web' !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}
</style>
