import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from './App.vue';
import { i18n } from '@/common/ui';
import {
  Affix,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Menu,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Tree,
} from 'ant-design-vue';
import 'ant-design-vue/es/message/style';
import 'ant-design-vue/es/notification/style';

const Settings = () => import('@/views/Settings.vue');
const Rules = () => import('@/views/Rules.vue');
const Batch = () => import('@/views/Batch.vue');
const About = () => import('@/views/About.vue');

const components = [
  Affix,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Menu,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Tree,
];
const app = createApp(App);
components.forEach(component => {
  app.use(component);
});

const routes = [
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
  },
  {
    path: '/rules',
    name: 'Rules',
    component: Rules,
  },
  {
    path: '/batch',
    name: 'Batch',
    component: Batch,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/settings',
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

app.use(router);

app.config.globalProperties.$i18n = i18n;

app.mount('#app');
