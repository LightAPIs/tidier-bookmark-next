import { defineConfig } from 'vite';
import type { PluginOption } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import copyPack from 'rollup-plugin-copy';
import zipPack from 'vite-plugin-zip-pack';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import packageInfo from './package.json';

const productionMode = process.env.NODE_ENV === 'production';
const modeName = productionMode ? 'build' : 'dist';

const htmlNames = ['popup', 'options'];
const jsNames = ['background'];
const pages = {};
htmlNames.forEach(name => {
  pages[name] = `src/${name}/index.html`;
});
jsNames.forEach(name => {
  pages[name] = `src/${name}/index.ts`;
});
const outDir = `${path.resolve(__dirname, modeName)}`;

const plugins: PluginOption[] = [
  vue(),
  Components({
    dts: true,
    resolvers: [AntDesignVueResolver()],
  }),
  copyPack({
    targets: [
      {
        src: `src/manifest/manifest.${productionMode ? 'production' : 'development'}.json`,
        dest: modeName,
        rename: 'manifest.json',
      },
    ],
    hook: 'writeBundle',
  }),
];

if (process.env.ZIP_MODE === 'true') {
  plugins.push(
    zipPack({
      inDir: 'build',
      outDir: 'archive',
      outFileName: `${packageInfo.name}_v${packageInfo.version}.zip`,
    })
  );
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: pages,
      output: {
        entryFileNames: 'js/[name].js',
      },
    },
    outDir,
    sourcemap: !productionMode,
    chunkSizeWarningLimit: 1024,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  publicDir: 'src/assets',
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@import "./src/less/global.less";',
      },
    },
  },
  plugins,
});
