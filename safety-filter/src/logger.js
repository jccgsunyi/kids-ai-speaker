import fs from 'fs';
import path from 'path';

export class ConversationLogger {
  constructor(logDir = '/app/logs') {
    this.logDir = logDir;
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  }
  
  log(entry) {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `conversations-${dateStr}.jsonl`);
    const logEntry = { ...entry, timestamp: date.toISOString() };
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    if (entry.type === 'blocked_input' || entry.type === 'filtered_output') {
      fs.appendFileSync(path.join(this.logDir, `safety-${dateStr}.jsonl`), JSON.stringify(logEntry) + '\n');
    }
  }
}