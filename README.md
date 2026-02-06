# Stock Server

股票数据代理服务 - 基于新浪财经API

## 项目概述

本项目为股票训练应用提供后端数据服务，代理新浪财经的股票日K线数据。

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

服务将启动在 http://localhost:3001

### 生产构建

```bash
npm run build
npm start
```

## API 接口

### 1. 健康检查

```
GET /health
```

### 2. 获取股票日K线数据

```
GET /api/stock/kline?code=600519&days=500
```

**参数：**
- `code` (string): 股票代码，如 600519（贵州茅台）
- `days` (number): 数据天数，默认500，最大1023

**响应示例：**
```json
{
  "symbol": "sh600519",
  "code": "600519",
  "name": "贵州茅台",
  "exchange": "sh",
  "data": [
    {
      "day": "2024-01-26",
      "open": 1340.51,
      "high": 1355,
      "low": 1325.12,
      "close": 1342,
      "volume": 8016606
    }
  ],
  "dataCount": 1
}
```

### 3. 获取股票基本信息

```
GET /api/stock/info?code=600519
```

**响应示例：**
```json
{
  "symbol": "sh600519",
  "code": "600519",
  "name": "贵州茅台",
  "exchange": "sh"
}
```

## 技术栈

- **Node.js** + **TypeScript**
- **Express** - Web框架
- **Axios** - HTTP客户端
- **iconv-lite** - 编码转换（处理新浪GBK编码）

## 数据源

- **新浪财经 API**
  - K线数据：`http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData`
  - 实时行情：`http://hq.sinajs.cn`

## 项目结构

```
stock-server/
├── src/
│   ├── index.ts              # 入口文件
│   ├── routes/
│   │   └── stock.ts          # 股票路由
│   ├── services/
│   │   └── sinaService.ts    # 新浪API服务
│   └── types/
│       └── stock.ts          # 类型定义
├── package.json
├── tsconfig.json
└── README.md
```

## 注意事项

1. 新浪API限制：最多返回1023条数据
2. 股票代码格式：自动识别上海（sh）和深圳（sz）交易所
3. 请求头要求：必须添加 Referer 头才能正常访问新浪API

## 与前端的联调

假设前端项目运行在 http://localhost:5173，添加如下代理配置：

**vite.config.ts:**
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

这样前端可以通过 `/api/stock/kline?code=600519` 访问股票数据。