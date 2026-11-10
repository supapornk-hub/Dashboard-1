import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SurveyResponse {
  id: string;
  timestamp: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  average: number;
  suggestion: string;
  deviceFingerprint?: string;
}

const sampleResponses: SurveyResponse[] = [
  {
    id: 'sample-1',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    q1: 5,
    q2: 5,
    q3: 4,
    q4: 5,
    q5: 5,
    average: 4.8,
    suggestion: 'วิทยากรอธิบายเข้าใจง่ายมาก มีตัวอย่างจริงให้ฝึกปฏิบัติ ชัดเจนดีครับ',
    deviceFingerprint: 'demo-1'
  },
  {
    id: 'sample-2',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    q1: 4,
    q2: 5,
    q3: 5,
    q4: 4,
    q5: 5,
    average: 4.6,
    suggestion: 'สไลด์สวยงาม เนื้อหาทันสมัยและตอบโจทย์การทำงานปัจจุบันมากค่ะ',
    deviceFingerprint: 'demo-2'
  },
  {
    id: 'sample-3',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    q1: 5,
    q2: 4,
    q3: 4,
    q4: 4,
    q5: 4,
    average: 4.2,
    suggestion: 'อยากให้เพิ่มเวลาในช่วง Workshop อีกนิดนึงครับ สนุกมาก',
    deviceFingerprint: 'demo-3'
  },
  {
    id: 'sample-4',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 5,
    q5: 5,
    average: 5.0,
    suggestion: 'ดีเยี่ยมทุกขั้นตอน จัดอบรมได้ตรงเวลาและประทับใจมากค่ะ',
    deviceFingerprint: 'demo-4'
  }
];

let responses: SurveyResponse[] = [...sampleResponses];
const sseClients: Response[] = [];

function broadcastUpdate(type: string, data: any) {
  const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/responses', (_req: Request, res: Response) => {
    res.json({
      success: true,
      count: responses.length,
      data: responses
    });
  });

  app.post('/api/responses', (req: Request, res: Response) => {
    const { q1, q2, q3, q4, q5, suggestion, deviceFingerprint } = req.body;

    const scores = [Number(q1), Number(q2), Number(q3), Number(q4), Number(q5)];
    if (scores.some((s) => isNaN(s) || s < 1 || s > 5)) {
      return res.status(400).json({ success: false, error: 'กรุณาให้คะแนน 1-5 ให้ครบทั้ง 5 ข้อ' });
    }

    const average = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
    const newEntry: SurveyResponse = {
      id: 'resp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      q1: scores[0],
      q2: scores[1],
      q3: scores[2],
      q4: scores[3],
      q5: scores[4],
      average,
      suggestion: typeof suggestion === 'string' ? suggestion.trim() : '',
      deviceFingerprint: deviceFingerprint || ''
    };

    responses.unshift(newEntry);
    broadcastUpdate('NEW_RESPONSE', newEntry);

    return res.status(201).json({
      success: true,
      message: 'บันทึกแบบประเมินเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็นครับ',
      data: newEntry
    });
  });

  app.delete('/api/responses', (_req: Request, res: Response) => {
    responses = [];
    broadcastUpdate('RESET', []);
    return res.json({ success: true, message: 'ล้างข้อมูลแบบประเมินทั้งหมดแล้ว' });
  });

  app.post('/api/responses/seed', (_req: Request, res: Response) => {
    const realisticSuggestions = [
      'วิทยากรให้คำแนะนำดีมากครับ เข้าใจง่ายและนำไปใช้ต่อได้ทันที',
      'เนื้อหาครอบคลุม เอกสารประกอบเข้าใจง่าย',
      'อยากให้มีคอร์สระดับ Advanced ต่อไปอีกครับ',
      'ชอบบรรยากาศการเรียนและกิจกรรมกลุ่ม สนุกและได้ความรู้',
      'การจัดสรรเวลาดีมาก เหมาะสมกับการเรียนรู้',
      'อุปกรณ์และห้องอบรมสะดวกสบายมากค่ะ',
      'ได้รับไอเดียใหม่ๆ ไปพัฒนางานในฝ่าย ขอบคุณทีมงานทุกคนนะคะ',
      'วิทยากรตอบคำถามได้ตรงประเด็นและเป็นกันเองมาก'
    ];

    const generated: SurveyResponse[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const q1 = Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3));
      const q2 = Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3));
      const q3 = Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3));
      const q4 = Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3));
      const q5 = Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3));
      const avg = Number(((q1 + q2 + q3 + q4 + q5) / 5).toFixed(2));
      const sug = Math.random() > 0.3 ? realisticSuggestions[i % realisticSuggestions.length] : '';

      generated.push({
        id: 'seed-' + Date.now() + '-' + i,
        timestamp: new Date(Date.now() - (count - i) * 8 * 60 * 1000).toISOString(),
        q1,
        q2,
        q3,
        q4,
        q5,
        average: avg,
        suggestion: sug,
        deviceFingerprint: 'seed-' + i
      });
    }

    responses = [...generated, ...responses];
    broadcastUpdate('SEED_DATA', responses);
    return res.json({ success: true, count: responses.length, data: responses });
  });

  // SSE Stream
  app.get('/api/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Initial state
    res.write(`data: ${JSON.stringify({ type: 'INIT', data: responses })}\n\n`);

    sseClients.push(res);

    // Keepalive ping every 25s
    const pingInterval = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(pingInterval);
      const index = sseClients.indexOf(res);
      if (index !== -1) {
        sseClients.splice(index, 1);
      }
    });
  });

  // Serve static standalone html files in /public or dynamically
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
