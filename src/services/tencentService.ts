import axios from 'axios';

export interface KLineData {
  day: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 判断是否为港股代码（5位数字）
 */
function isHKStock(code: string): boolean {
  return /^\d{5}$/.test(code);
}

/**
 * 获取沪深股票交易所前缀
 * 港股不需要，直接返回空字符串
 */
function getExchange(code: string): string {
  // 港股不需要交易所前缀
  if (isHKStock(code)) {
    return '';
  }
  
  const prefix = code.charAt(0);
  if (prefix === '6' || prefix === '9') return 'sh';
  if (prefix === '0' || prefix === '2' || prefix === '3') return 'sz';
  if (prefix === '4' || prefix === '8') return 'bj';
  return 'sz';
}

function safeParseFloat(value: string): number {
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

function safeParseInt(value: string): number {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * 解析腾讯财经返回的K线数据
 * 数据格式: latest_daily_data="num:100 total:7587...\n220527 14.29 14.18 14.35 14.11 723067\n..."
 * 字段: 日期(YYMMDD) 开盘 收盘 最高 最低 成交量
 */
function parseKLineData(dataStr: string): KLineData[] {
  const result: KLineData[] = [];
  const lines = dataStr.trim().split('\n');
  
  // 跳过第一行（metadata）
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(/\s+/);
    if (parts.length >= 6) {
      // 日期格式: YYMMDD
      const dateStr = parts[0];
      const year = 2000 + parseInt(dateStr.substring(0, 2), 10);
      const month = parseInt(dateStr.substring(2, 4), 10);
      const day = parseInt(dateStr.substring(4, 6), 10);
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      result.push({
        day: date,
        open: safeParseFloat(parts[1]),
        close: safeParseFloat(parts[2]),
        high: safeParseFloat(parts[3]),
        low: safeParseFloat(parts[4]),
        volume: safeParseInt(parts[5]),
      });
    }
  }
  
  // 按时间排序（从早到晚）
  return result.reverse();
}

/**
 * 获取股票K线数据（支持沪深和港股）
 * @param code 股票代码（沪深6位，港股5位）
 * @param days 获取天数（最大1023）
 */
export async function getKLineData(code: string, days: number = 500): Promise<KLineData[]> {
  const isHK = isHKStock(code);
  const exchange = getExchange(code);
  const dataLen = Math.min(Math.max(1, days), 1023);
  
  let url: string;
  if (isHK) {
    // 港股接口
    url = `http://data.gtimg.cn/flashdata/hk/latest/daily/hk${code}.js`;
  } else {
    // 沪深股票接口
    url = `http://data.gtimg.cn/flashdata/hushen/latest/daily/${exchange}${code}.js`;
  }

  const response = await axios.get(url, {
    headers: {
      Referer: 'http://stockpage.10jqka.com.cn',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const text: string = response.data;
  
  // 解析返回的数据
  const match = text.match(/latest_daily_data="([^"]*)"/);
  if (!match) {
    return [];
  }
  
  const klineData = parseKLineData(match[1]);
  
  // 根据days参数截取数据
  if (klineData.length > dataLen) {
    return klineData.slice(-dataLen);
  }
  
  return klineData;
}
