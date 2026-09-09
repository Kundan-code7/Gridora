import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import geminiHandler from './api/gemini.js';

function createLocalGeminiMiddleware(env) {
  return async (request, response, next) => {
    if (request.method !== 'POST') {
      next();
      return;
    }

    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', async () => {
      try {
        request.body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        if (!process.env.GEMINI_API_KEY && env.GEMINI_API_KEY) {
          process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
        }

        const responseAdapter = {
          setHeader: (name, value) => response.setHeader(name, value),
          status: statusCode => {
            response.statusCode = statusCode;
            return responseAdapter;
          },
          json: payload => {
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(payload));
          }
        };

        await geminiHandler(request, responseAdapter);
      } catch {
        response.statusCode = 500;
        response.end(JSON.stringify({ success: false, error: 'Local Gemini request failed.' }));
      }
    });
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-gemini-api',
        configureServer(server) {
          server.middlewares.use('/api/gemini', createLocalGeminiMiddleware(env));
        }
      }
    ],
    server: {
      port: 3000,
      open: false
    }
  };
});
