# ledger-app

主要技术栈：**React + TypeScript + Ant Design**。

## 目录

项目代码在 `ledger-app/`。

## 本地运行（Web）
```bash
cd ledger-app
npm install
npm run dev
```

## 本地长期使用（不跑 dev）

### 方式 A：构建后本地预览

```bash
cd ledger-app
npm install
npm run build
npm run start
```

`npm run start` 会启动一个本地预览服务（默认 `127.0.0.1:4173`）。你可以把这条命令做成系统启动项/桌面快捷方式。

### 方式 B：桌面版（双击打开）

```bash
cd ledger-app
npm install
npm run desktop:dist
```

打包产物会输出到 `ledger-app/release/`。之后即可双击运行（不需要 `npm run dev`）。
