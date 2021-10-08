import { createApp } from 'vue';
import App from './App.vue';
import Antd, { message } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.less';

// antd全局配置
message.config({
  top: `50px`,
  duration: 2,
  maxCount: 3,
});

const app = createApp(App);

app.use(Antd).mount('#app');
