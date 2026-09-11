import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_PATH = process.env.LOG_PATH || '/app/logs';
const PASSWORD = process.env.MONITOR_PASSWORD || 'changeme123';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const auth = (req, res, next) => {
  if (req.cookies?.auth_token === Buffer.from(PASSWORD).toString('base64') || ['/login', '/api/login'].includes(req.path)) next();
  else res.redirect('/login');
};

app.get('/login', (req, res) => res.send(getLoginPage()));
app.post('/api/login', (req, res) => {
  if (req.body.password === PASSWORD) {
    res.cookie('auth_token', Buffer.from(PASSWORD).toString('base64'), { httpOnly: true, maxAge: 7*24*60*60*1000 });
    res.json({ success: true });
  } else res.status(401).json({ success: false });
});
app.get('/logout', (req, res) => { res.clearCookie('auth_token'); res.redirect('/login'); });
app.use(auth);
app.get('/', (req, res) => res.send(getDashboardPage()));

app.get('/api/logs/:date', (req, res) => {
  const logFile = path.join(LOG_PATH, `conversations-${req.params.date}.jsonl`);
  if (!fs.existsSync(logFile)) return res.json({ logs: [] });
  const logs = fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean).reverse();
  res.json({ logs });
});

app.get('/api/dates', (req, res) => {
  if (!fs.existsSync(LOG_PATH)) return res.json({ dates: [] });
  const dates = fs.readdirSync(LOG_PATH).filter(f => f.startsWith('conversations-')).map(f => f.replace('conversations-', '').replace('.jsonl', '')).sort().reverse();
  res.json({ dates });
});

app.get('/api/summary/:date', (req, res) => {
  const logFile = path.join(LOG_PATH, `conversations-${req.params.date}.jsonl`);
  let conv = 0, blocked = 0, filtered = 0;
  if (fs.existsSync(logFile)) {
    fs.readFileSync(logFile, 'utf8').trim().split('\n').forEach(l => {
      try { const e = JSON.parse(l); if(e.type==='conversation')conv++; if(e.type==='blocked_input')blocked++; if(e.type==='filtered_output')filtered++; } catch {}
    });
  }
  res.json({ totalConversations: conv, blockedInputs: blocked, filteredOutputs: filtered });
});

app.listen(PORT, () => console.log(`Monitor running on port ${PORT}`));

function getLoginPage() { return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>家长监控</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;align-items:center;justify-content:center}.box{background:#fff;padding:40px;border-radius:16px;width:100%;max-width:400px;text-align:center}h1{margin-bottom:10px}input{width:100%;padding:15px;border:2px solid #e0e0e0;border-radius:8px;margin-bottom:20px}button{width:100%;padding:15px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:8px;cursor:pointer}</style></head><body><div class="box"><h1>🔐 家长监控</h1><p style="color:#666;margin-bottom:30px">儿童AI音箱对话监控</p><form id="f"><input type="password" id="p" placeholder="请输入密码" required><button type="submit">登录</button></form></div><script>document.getElementById("f").onsubmit=async e=>{e.preventDefault();const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:document.getElementById("p").value})});r.ok?location.href="/":alert("密码错误")}</script></body></html>'; }
function getDashboardPage() { return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>家长监控</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:sans-serif;background:#f5f7fa}.header{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:20px;display:flex;justify-content:space-between}.container{max-width:1200px;margin:0 auto;padding:20px}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:30px}.card{background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,.1)}.card h3{color:#666;font-size:14px}.card .v{font-size:32px;font-weight:bold}.warn .v{color:#e74c3c}.controls{background:#fff;padding:15px;border-radius:12px;margin-bottom:20px}select{padding:10px;border:2px solid #e0e0e0;border-radius:8px}.logs{background:#fff;border-radius:12px}.log{padding:15px 20px;border-bottom:1px solid #f0f0f0}.log.blocked{background:#fff5f5}.time{color:#999;font-size:12px}.type{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;margin:8px 0}.type.c{background:#e3f2fd;color:#1976d2}.type.b{background:#ffebee;color:#c62828}.user::before{content:"👶 "}.ai::before{content:"🌟 "}.empty{text-align:center;padding:40px;color:#999}</style></head><body><div class="header"><h1>👨‍👩‍👧 家长监控</h1><a href="/logout" style="color:#fff">退出</a></div><div class="container"><div class="stats"><div class="card"><h3>今日对话</h3><div class="v" id="conv">-</div></div><div class="card warn"><h3>拦截</h3><div class="v" id="block">-</div></div><div class="card warn"><h3>过滤</h3><div class="v" id="filter">-</div></div></div><div class="controls">日期：<select id="date"></select></div><div class="logs" id="logs"><div class="empty">加载中...</div></div></div><script>let d=new Date().toISOString().split("T")[0];async function load(){const r=await fetch("/api/dates");const{dates}=await r.json();const s=document.getElementById("date");if(!dates.length){s.innerHTML="<option>无记录</option>";return}s.innerHTML=dates.map(x=>`<option ${x===d?"selected":""}>${x}</option>`).join("");if(!dates.includes(d))d=dates[0];loadData()}async function loadData(){const[sum,logs]=await Promise.all([fetch(`/api/summary/${d}`).then(r=>r.json()),fetch(`/api/logs/${d}`).then(r=>r.json())]);document.getElementById("conv").textContent=sum.totalConversations;document.getElementById("block").textContent=sum.blockedInputs;document.getElementById("filter").textContent=sum.filteredOutputs;const el=document.getElementById("logs");if(!logs.logs?.length){el.innerHTML="<div class=empty>暂无记录</div>";return}el.innerHTML=logs.logs.map(i=>{const t=new Date(i.timestamp).toLocaleTimeString("zh-CN");const tc=i.type==="blocked_input"?"b":i.type==="filtered_output"?"b":"c";const tt=i.type==="blocked_input"?"已拦截":i.type==="filtered_output"?"已过滤":"对话";return`<div class="log ${i.type!=="conversation"?"blocked":""}"><div class=time>${t}</div><span class="type ${tc}">${tt}</span>${i.userMessage?`<div class=user>${i.userMessage}</div>`:""}${i.aiResponse?`<div class=ai>${i.aiResponse}</div>`:""}</div>`}).join("")}document.getElementById("date").onchange=e=>{d=e.target.value;loadData()};setInterval(loadData,30000);load()</script></body></html>'; }