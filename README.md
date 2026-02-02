# 金价信息记录网站

每日自动记录金价数据的网站，通过 GitHub Actions 定时获取京东金融金价数据。

## 技术栈

- React + TypeScript + Vite
- TailwindCSS + @coss/ui
- ECharts
- GitHub Actions + GitHub Pages

## 功能

### 首页
- 年度金价趋势图
- 当前最新金价、涨跌幅
- 日期选择器跳转到详情页

### 详情页
- 当日金价走势图
- 开盘价、收盘价、最高/最低价
- 前后日期切换

## 数据来源

京东金融 API：

| 接口 | 用途 |
|------|------|
| `todayPrices` | 当天金价走势 |
| `latestPrice` | 最新金价 |
| `historyPrices` | 历史金价（年度） |

## 数据存储

```
data/
├── yearly/
│   └── 2025.json       # 年度汇总
└── 2025/
    └── 04/
        └── 21.json     # 每日数据
```

GitHub Actions 每天 23:55-23:59 多次执行，确保数据获取成功。

## 开发

```bash
# 安装依赖
pnpm install

# 开发
pnpm dev

# 构建
pnpm build
```

## 许可

MIT
