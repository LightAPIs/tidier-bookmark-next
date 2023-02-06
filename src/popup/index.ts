import { createApp } from 'vue';
import App from './App.vue';
import { i18n } from '@/common/ui';
import { Row, Col, Space, Button, Form, Input, InputNumber, TreeSelect, Modal, Tag, Tooltip } from 'ant-design-vue';
import 'ant-design-vue/es/message/style';

const components = [Row, Col, Space, Button, Form, Input, InputNumber, TreeSelect, Modal, Tag, Tooltip];
const app = createApp(App);
components.forEach(component => {
  app.use(component);
});

app.config.globalProperties.$i18n = i18n;

app.mount('#app');
