// app.ts / server.ts (apply near where routers are mounted)
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth'; // adjust path if different

const app = express();

// middleware (ensure these run BEFORE routers)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS (allow credentials and your frontend origin)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.options('*', cors());

// Mount authRouter on BOTH paths so old & new clients work
app.use(['/auth', '/api/auth'], authRouter);

// ...mount other routers...
// e.g. app.use('/purchase', purchaseRouter);

// optional: health
app.get(['/health', '/api/health'], (req, res) => res.json({ status: 'ok' }));

export default app;
