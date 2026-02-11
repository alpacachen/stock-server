import { Router, Request, Response } from 'express';
import { getKLineData } from '../services/sinaService';
import { getHotStocks } from '../services/eastmoneyService';

const router = Router();

const STOCK_CODE_PATTERN = /^\d{6}$/;

router.get('/kline', async (req: Request, res: Response) => {
  try {
    const { code, days } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: '缺少股票代码参数 (code)',
      });
    }

    if (!STOCK_CODE_PATTERN.test(code)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '股票代码格式不正确，应为6位数字',
      });
    }

    let daysNum = 500;
    if (days !== undefined) {
      const parsed = parseInt(days as string, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'days 参数应为正整数',
        });
      }
      daysNum = Math.min(parsed, 1023);
    }

    const data = await getKLineData(code, daysNum);

    if (data.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `未找到股票 ${code} 的数据`,
      });
    }

    return res.json(data);
  } catch (error) {
    console.error('获取股票数据失败:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : '服务器内部错误',
    });
  }
});

// 获取东方财富热门股票排行榜
router.get('/hot', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    let limitNum = 100;
    if (limit !== undefined) {
      const parsed = parseInt(limit as string, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'limit 参数应为正整数',
        });
      }
      limitNum = Math.min(parsed, 200);
    }

    const result = await getHotStocks(limitNum);

    if (result.data.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: '未获取到热门股票数据',
      });
    }

    return res.json(result);
  } catch (error) {
    console.error('获取热门股票失败:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : '服务器内部错误',
    });
  }
});

export default router;
