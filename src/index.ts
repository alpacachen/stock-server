import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import stockRouter from './routes/stock';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/stock', stockRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Stock Server running on http://localhost:${PORT}`);
});
