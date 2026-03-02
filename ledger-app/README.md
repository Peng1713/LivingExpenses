# ledger-app

本地日常记账应用（React + TypeScript + Ant Design），数据只保存在本机（IndexedDB），无后端服务。

## 功能

- **记账**：日期/时间选择、分类、金额、备注；按日分组；筛选与编辑/删除
- **统计**：月度分类占比、每日趋势、分类柱状图
- **分析**：区间趋势、Top 分类/Top 单笔、异常日提示
- **数据**：本地持久化 + JSON 导入/导出备份

## 本地开发

```bash
npm install
npm run dev
```

## 本地长期使用（不跑 dev）

### 方式 A：构建后预览

```bash
npm run build
npm run start
```

### 方式 B：桌面版

```bash
npm run desktop:dist
```

产物输出到 `release/`，之后可以双击运行。
