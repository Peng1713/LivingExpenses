# ledger-app（本地记账账本）

一个用于日常生活记账的本地应用，主要技术栈：**React + TypeScript + Ant Design**。

- **按天区分**：支持日期/时间选择，账单按日分组展示
- **一目了然**：筛选（日期范围/分类/备注关键词）、编辑/删除
- **统计**：月度分类占比、每日趋势、分类柱状图
- **分析**：区间趋势、Top 分类/Top 单笔、异常日提示
- **数据全本地**：使用 IndexedDB（通过 `localforage`），并支持 JSON 导入/导出备份
- **无需部署服务端**：无后端、无账号系统

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