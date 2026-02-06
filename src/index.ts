import express, { Request, Response } from 'express';
import cors from 'cors';
import stockRouter from './routes/stock';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/stock', stockRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: Error, req: Request, res: Response) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Stock Server running on http://localhost:${PORT}`);
});
