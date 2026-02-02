# 金价信息记录网站

每日自动记录金价数据的网站，通过 GitHub Actions 定时获取京东金融金价数据。

**在线访问**: https://l123wx.github.io/gold/

## 技术栈

- React 19 + TypeScript + Vite
- TailwindCSS
- ECharts
- React Router
- Lucide React
- GitHub Actions + GitHub Pages

## 功能

### 首页

- 年度金价趋势图（可点击跳转到详情页）
- 当前最新金价、涨跌幅
- 日期选择器跳转到详情页

### 详情页

- 当日金价走势图
- 开盘价、收盘价、最高/最低价
- 涨跌幅显示
- 前后日期切换
- 返回首页

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
│   └── 2026.json           # 年度汇总
└── 2026/
    └── 02/
        ├── 03.json         # 每日走势数据
        └── 03-latest.json  # 每日最新价格
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

# 预览构建
pnpm preview

# 获取金价数据
pnpm fetch-price
```

## 部署

推送到 `master` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

需要在仓库 Settings > Pages 中将 Source 设置为 "GitHub Actions"。

## 许可

MIT
