import { Router, Request, Response } from 'express';
import { getKLineData } from '../services/sinaService';

const router = Router();

router.get('/kline', async (req: Request, res: Response) => {
  try {
    const { code, days } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: '缺少股票代码参数 (code)',
      });
    }

    const daysNum = days ? Math.min(parseInt(days as string, 10) || 500, 1023) : 500;
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

export default router;
