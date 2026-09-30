import dotenv from 'dotenv';
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from 'express';
import { fileURLToPath } from 'node:url';
import { checkCompatibilityRouter } from './routes/checkCompatibility.js';
import { generateDrinkRouter } from './routes/generateDrink.js';

// Load backend/.env no matter which directory the server is started from
// (the path is the same from src/ and from the compiled dist/).
// The Gemini client reads the key lazily, so import order doesn't matter.
dotenv.config({
  path: fileURLToPath(new URL('../.env', import.meta.url)),
  quiet: true,
});

const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});
app.use('/api/generate-drink', generateDrinkRouter);
app.use('/api/check-compatibility', checkCompatibilityRouter);

const onError: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  // Malformed or oversized JSON bodies end up here.
  const status = err?.status === 413 ? 413 : 400;
  res.status(status).json({
    error:
      status === 413
        ? 'That request is too large.'
        : 'Send a valid JSON body with an ingredients list.',
  });
};
app.use(onError);

// Bind to localhost only so this unauthenticated API isn't exposed to the network.
app.listen(PORT, 'localhost', () => {
  console.log(`Cafe Palette API listening on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.warn(
      'Warning: GEMINI_API_KEY is empty. Add it to backend/.env to enable drink generation.',
    );
  }
});
