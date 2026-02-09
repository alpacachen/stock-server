import axios from 'axios';

export interface HotStock {
  code: string;
  name: string;
  rank: number;
  market: string;
}

export interface HotStocksResponse {
  data: HotStock[];
  total: number;
}

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://vipmoney.eastmoney.com/',
};

/**
 * 获取东方财富热门股票排行榜
 * @param limit 返回数量，默认100
 */
export async function getHotStocks(limit: number = 100): Promise<HotStocksResponse> {
  const url = 'https://emappdata.eastmoney.com/stockrank/getAllCurrentList';

  const response = await axios.post(
    url,
    {
      appId: 'appId01',
      globalId: '786e4c21-70dc-435a-93bb-38',
      marketType: '',
      pageNo: 1,
      pageSize: limit,
    },
    {
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  const result = response.data;

  if (result.status === -1) {
    console.warn('热门股票API返回异常:', result.message);
    return { data: [], total: 0 };
  }

  if (result.data && Array.isArray(result.data)) {
    const hotStocks: HotStock[] = result.data.map((item: any) => {
      const sc = item.sc || '';
      const code = sc.replace(/^(SH|SZ|BJ)/, '');
      const market = sc.startsWith('SH') ? '1' : sc.startsWith('SZ') ? '0' : sc.startsWith('BJ') ? '2' : '';
      return {
        code,
        name: item.nm || '',
        rank: item.rk || 0,
        market,
      };
    });

    return {
      data: hotStocks,
      total: result.total || hotStocks.length,
    };
  }

  return { data: [], total: 0 };
}
