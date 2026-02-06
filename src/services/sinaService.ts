import axios from 'axios';

interface SinaKLineRawData {
  day: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

function getExchange(code: string): 'sh' | 'sz' {
  return code.startsWith('6') ? 'sh' : 'sz';
}

export async function getKLineData(code: string, days: number = 500) {
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
    open: parseFloat(item.open) || 0,
    high: parseFloat(item.high) || 0,
    low: parseFloat(item.low) || 0,
    close: parseFloat(item.close) || 0,
    volume: parseInt(item.volume, 10) || 0,
  }));
}
