# 金价信息记录网站

这是一个记录每日金价的网站

## 技术栈：

 - Vite、Vue3
 - Github Action

## 功能板块

### 历史金价

 - 打开页面时优先展示年度数据，点击之后再切换为具体日期的数据；
 - 使用 Github Action 每天 24:00 前，通过接口获取当天的金价数据，生成 json 文件记录到一个文件夹中，json 文件可以使用当天的日期命名；同时请求历史数据，记录年度数据；
 - 页面直接通过获取 github 文件的方式读取json文件，项目代码会存在公开项目，可以直接访问

## 接口

来源：京东金融

### 获取当天金价折线图数据

 - url: https://ms.jr.jd.com/gw/generic/hj/h5/m/todayPrices
 - 请求类型: POST
 - 请求参数: 无

#### 响应示例

```json
{
  "resultData": {
    "datas": [
      {
        "name": "2025-04-21 09:06:00",
        "value": [
          "2025-04-21 09:06:00",
          "799.37"
        ]
      },
      {
        "name": "2025-04-21 09:08:00",
        "value": [
          "2025-04-21 09:08:00",
          "799.86"
        ]
      },
    ],
    "status": "SUCCESS"
  },
  "success": true,
  "resultCode": 0,
  "resultMsg": "成功",
  "channelEncrypt": 0
}
```

### 获取最新金价

 - url: https://ms.jr.jd.com/gw/generic/hj/h5/m/latestPrice
 - 请求类型: POST
 - 请求参数: 无

#### 响应示例

```json
  {
    "resultData": {
      "datas": {
        "upAndDownRate": "+2.61%",
        "productSku": "P005",
        "demode": false,
        "priceNum": "EDF5E4E3CA8C8B7D7B4E5A233D9F01A6",
        "price": "808.95",
        "yesterdayPrice": "788.38",
        "upAndDownAmt": "+20.57",
        "time": "1745247178000",
        "id": 69633103
      },
      "status": "SUCCESS"
    },
    "success": true,
    "resultCode": 0,
    "resultMsg": "成功",
    "channelEncrypt": 0
  }
```

### 获取历史金价

 - url: https://ms.jr.jd.com/gw/generic/hj/h5/m/historyPrices
 - 请求类型: POST
 - 请求参数: 
  - query: reqData: {"period":"y"}

#### 响应示例

```json
{
  "resultData": {
    "datas": [
      {
        "name": "2025-04-21 09:06:00",
        "value": [
          "2025-04-21 09:06:00",
          "799.37"
        ]
      },
      {
        "name": "2025-04-21 09:08:00",
        "value": [
          "2025-04-21 09:08:00",
          "799.86"
        ]
      },
    ],
    "status": "SUCCESS"
  },
  "success": true,
  "resultCode": 0,
  "resultMsg": "成功",
  "channelEncrypt": 0
}
```
 
