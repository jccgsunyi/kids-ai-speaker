import express from 'express';
import { SafetyFilter } from './filter.js';
import { ConversationLogger } from './logger.js';
import { proxyRequest } from './proxy.js';

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PROXY_PORT || 8080;
const TARGET_BASE_URL = process.env.TARGET_BASE_URL || 'https://api.siliconflow.cn/v1';
const TARGET_API_KEY = process.env.TARGET_API_KEY || '';

const filter = new SafetyFilter();
const logger = new ConversationLogger();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { messages, model } = req.body;
    const lastUserMessage = messages?.filter(m => m.role === 'user').pop()?.content || '';
    
    const inputResult = filter.filterInput(lastUserMessage);
    if (!inputResult.safe) {
      logger.log({ type: 'blocked_input', reason: inputResult.reason, userMessage: lastUserMessage });
      return res.json({
        id: `blocked-${Date.now()}`,
        object: 'chat.completion',
        choices: [{ message: { role: 'assistant', content: filter.getSafeResponse(inputResult.reason) }, finish_reason: 'stop' }]
      });
    }
    
    const llmResponse = await proxyRequest({ baseUrl: TARGET_BASE_URL, apiKey: TARGET_API_KEY, body: req.body });
    
    if (llmResponse.choices?.[0]?.message?.content) {
      const outputResult = filter.filterOutput(llmResponse.choices[0].message.content);
      if (!outputResult.safe) {
        llmResponse.choices[0].message.content = filter.getSafeResponse('unsafe_output');
      }
      logger.log({ type: 'conversation', userMessage: lastUserMessage, aiResponse: llmResponse.choices[0].message.content });
    }
    
    res.json(llmResponse);
  } catch (error) {
    res.status(500).json({ error: { message: 'Safety filter error' } });
  }
});

app.listen(PORT, () => console.log(`Safety Filter running on port ${PORT}`));