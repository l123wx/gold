# 金价信息记录网站设计文档

## 概述

一个记录每日金价的网站，通过 GitHub Actions 每天自动获取京东金融的金价数据，存储为 JSON 文件，前端直接读取 GitHub 仓库中的数据展示。

## 技术选型

| 类别 | 选择 |
|------|------|
| 框架 | React + TypeScript + Vite |
| 样式 | TailwindCSS |
| 组件库 | @coss/ui |
| 图表 | ECharts |
| 路由 | React Router |
| 图标 | Lucide React |
| 部署 | GitHub Pages |
| 定时任务 | GitHub Actions |

## 项目结构

```
gold/
├── .github/workflows/
│   ├── deploy.yml          # 构建部署到 GitHub Pages
│   └── fetch-price.yml     # 定时获取金价数据
├── data/
│   ├── yearly/
│   │   └── 2025.json       # 年度汇总数据（API 原始格式）
│   └── 2025/
│       └── 04/
│           └── 21.json     # 每日详细数据（API 原始格式）
├── src/
│   ├── pages/
│   │   ├── Home.tsx        # 首页 - 年度趋势图
│   │   └── DayDetail.tsx   # 详情页 - 某天金价走势
│   ├── components/
│   │   └── PriceChart.tsx  # ECharts 图表组件
│   ├── router/
│   │   └── index.tsx
│   └── main.tsx
├── scripts/
│   └── fetch-price.ts      # 获取金价的脚本（Actions 执行）
└── package.json
```

## 页面设计

### 首页 (`/`)

- 展示年度金价趋势图（ECharts 折线图）
- 显示当前最新金价、涨跌幅
- 提供日期选择器，选择后跳转到详情页
- 点击图表上的数据点可跳转到对应日期详情页

### 详情页 (`/day/:date`)

- 展示该日金价走势图（当天各时间点的价格变化）
- 显示当日开盘价、收盘价、最高/最低价
- 返回首页按钮
- 前后日期切换按钮

## 数据流

### 数据获取流程

```
GitHub Actions (23:55/23:57/23:59)
    → 调用京东金融 API
    → 生成 JSON 文件
    → git commit && push
```

### 前端读取流程

```
页面加载
    → fetch GitHub raw 文件
    → 解析 JSON
    → ECharts 渲染
```

数据 URL 格式：
- 年度数据：`https://raw.githubusercontent.com/l123wx/gold/master/data/yearly/2025.json`
- 每日数据：`https://raw.githubusercontent.com/l123wx/gold/master/data/2025/04/21.json`

## GitHub Actions 配置

### fetch-price.yml

```yaml
name: Fetch Gold Price

on:
  schedule:
    - cron: '55 15 * * *'  # 北京时间 23:55
    - cron: '57 15 * * *'  # 北京时间 23:57
    - cron: '59 15 * * *'  # 北京时间 23:59
  workflow_dispatch:       # 支持手动触发

env:
  TZ: Asia/Shanghai

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: npm install
      - run: npx tsx scripts/fetch-price.ts
      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/
          git diff --staged --quiet || git commit -m "chore: 更新金价数据"
          git push
```

### deploy.yml

参考 starter-github-pages 模板，代码变更时自动构建部署。

## API 接口

数据来源：京东金融

| 接口 | 用途 | 方法 |
|------|------|------|
| `/gw/generic/hj/h5/m/todayPrices` | 当天金价走势 | POST |
| `/gw/generic/hj/h5/m/latestPrice` | 最新金价 | POST |
| `/gw/generic/hj/h5/m/historyPrices` | 历史金价（年度） | POST |

JSON 文件直接存储 API 原始响应。

## 设计规范

遵循项目 CLAUDE.md 规范：

- **组件**：优先使用 @coss/ui 组件
- **颜色**：使用 CSS 变量（`text-primary`、`bg-accent`、`text-muted-foreground`）
- **尺寸**：Tab 栏 `h-9`、小按钮 `h-6`
- **间距**：紧凑 `gap-1`、标准 `gap-2`
- **图标**：Lucide React
- **文本截断**：`min-w-0 flex-1 truncate`
- **提交信息**：Conventional Commits 规范
