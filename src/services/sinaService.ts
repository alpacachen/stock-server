import axios from 'axios';

interface SinaKLineRawData {
  day: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface KLineData {
  day: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function getExchange(code: string): string {
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

export async function getKLineData(code: string, days: number = 500): Promise<KLineData[]> {
  const symbol = `${getExchange(code)}${code}`;
  const dataLen = Math.min(Math.max(1, days), 1023);

  const response = await axios.get(
    'http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData',
    {
      params: {
        symbol,
        scale: 240,
        ma: 'no',
        datalen: dataLen,
      },
      headers: {
        Referer: 'https://finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0',
      },
    }
  );

  const rawData = response.data;

  if (!Array.isArray(rawData)) {
    return [];
  }

  return rawData.map((item: SinaKLineRawData) => ({
    day: item.day,
    open: safeParseFloat(item.open),
    high: safeParseFloat(item.high),
    low: safeParseFloat(item.low),
    close: safeParseFloat(item.close),
    volume: safeParseInt(item.volume),
  }));
}
