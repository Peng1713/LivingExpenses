# 生活账单项目（React + TypeScript + Ant Design）

一个本地可运行的日常记账项目，满足：

- 手动填写账单内容、金额、分类、消费时间
- 按天区分账单明细，可按日期快速筛选
- 统计与分析（分类占比、每日趋势、区间指标）
- 数据持久化到浏览器 `localStorage`，无需后端部署
- 支持编辑、删除历史账单

## 技术栈

- React 19 + TypeScript
- Vite
- Ant Design
- dayjs
- ECharts（echarts-for-react）

## 本地启动

```bash
npm install
npm run dev
```

默认启动后访问终端输出的本地地址（通常是 `http://localhost:5173`）。

## 构建

```bash
npm run build
```

## 主要功能说明

1. **新增账单**
   - 内容（必填）
   - 金额（必填，>0）
   - 分类（如：日用品、生活娱乐、出行交通、餐饮等）
   - 消费时间（支持日期+时间选择）
   - 备注（可选）

2. **账单明细**
   - 自动按天分组展示
   - 支持按某一天筛选
   - 可编辑与删除记录

3. **统计与分析**
   - 自定义分析区间
   - 区间总支出、日均支出
   - 支出最高分类与最高支出日
   - 分类占比图 + 每日支出趋势图

## 数据存储

- 所有数据存储在浏览器本地 `localStorage`
- 存储 key：`living-expenses-records-v1`
- 清空浏览器站点数据后记录会被清除
