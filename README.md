# ElectronMediaPreviewer
基于 Electron 开发的多媒体消息预览组件: 图片/视频.

## 运行环境
```
# Electron   14.0.0
# Node       14.17.0
# Chromium   93.0.4577.58
```

## 项目安装
```
yarn install
```

### 开发环境运行 `Vue`
```
yarn serve
```

### 生产环境构建 `Vue`
```
yarn build
```

### 代码质量/风格检查/修复
```
yarn lint
```

### 预览组件运行 `Electron`
yarn start

### 更多自定义配置
See [Configuration Reference](https://cli.vuejs.org/config/).

## 组件使用

```js
// main.js
const { useMediaPreviewer } = require('./MediaPreviewer/main');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  
  // 注册预览组件
  useMediaPreviewer(mainWindow);
}

...
```

更多详细代码请参考 `electron` 目录.