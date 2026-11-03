/**
 * RR Computers - Zero-Dependency Local / Production Server
 * Govt Authorized e-Seva & CSC Portal
 * Built with native Node.js (No external npm packages required)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');

const PORT = process.env.PORT || 8081;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const LEADS_FILE = path.join(ROOT_DIR, 'leads.json');

// MIME type dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.zip': 'application/zip',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8'
};

// In-memory counter for visits
let visits = {
  today: 42,
  total: 1250,
  lastDate: new Date().toISOString().slice(0, 10)
};

function readLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function saveLeads(leads) {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
  } catch (e) {}
}


const OWNER_EMAIL = process.env.OWNER_EMAIL || 'rrcsc007@gmail.com';

function forwardFeedbackEmail(lead) {
  try {
    const postData = JSON.stringify({
      'Category / வகை': lead.type,
      'Message / செய்தி': lead.msg,
      'Contact / தொடர்பு': lead.contact || 'Not provided',
      'Rating / மதிப்பீடு': lead.rate ? `${lead.rate} / 5 Stars` : 'Not rated',
      'Source Page / பக்கம்': lead.page,
      'Language / மொழி': lead.lang,
      'Date & Time / நேரம்': new Date(lead.t).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      '_subject': `[RR Computers] New ${lead.type.toUpperCase()} from ${lead.page}`,
      '_template': 'table'
    });

    const options = {
      hostname: 'formsubmit.co',
      port: 443,
      path: '/ajax/' + encodeURIComponent(OWNER_EMAIL),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'http://localhost:8081/'
      }
    };

    const forwardReq = https.request(options, (forwardRes) => {
      let respBody = '';
      forwardRes.on('data', chunk => { respBody += chunk; });
      forwardRes.on('end', () => {
        console.log(`[EMAIL FORWARD] HTTP ${forwardRes.statusCode} -> ${OWNER_EMAIL}:`, respBody.slice(0, 100));
      });
    });

    forwardReq.on('error', (e) => {
      console.error('[EMAIL FORWARD ERROR]:', e.message);
    });

    forwardReq.write(postData);
    forwardReq.end();
  } catch (err) {
    console.error('[EMAIL FORWARD EXCEPTION]:', err.message);
  }
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost:' + PORT));
  const pathname = reqUrl.pathname;

  // Set standard CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Routes ---
  if (pathname === '/api/visit') {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (visits.lastDate !== todayStr) {
      visits.today = 0;
      visits.lastDate = todayStr;
    }
    if (req.method === 'POST') {
      visits.today++;
      visits.total++;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, today: visits.today, total: visits.total }));
    return;
  }

  if (pathname === '/api/hit') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (pathname === '/api/feedback' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const leads = readLeads();
        const newLead = {
          id: 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          t: Date.now(),
          type: payload.type || 'request',
          rate: payload.rate || 0,
          msg: payload.msg || '',
          contact: payload.contact || '',
          page: payload.page || 'index.html',
          lang: payload.lang || 'ta',
          status: 'open'
        };
        leads.unshift(newLead);
        saveLeads(leads);
        forwardFeedbackEmail(newLead);
        console.log('[LEAD RECEIVED]', newLead.type, newLead.contact, newLead.msg.slice(0, 40));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, id: newLead.id }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid payload' }));
      }
    });
    return;
  }

  if (pathname === '/api/feedback/list' && req.method === 'POST') {
    const leads = readLeads();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, items: leads }));
    return;
  }

  if (pathname === '/api/feedback/del' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        let leads = readLeads();
        leads = leads.filter(l => l.id !== payload.id);
        saveLeads(leads);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'failed' }));
      }
    });
    return;
  }

  if (pathname === '/api/updates') {
    const updatesFile = path.join(__dirname, 'data', 'updates.json');
    if (req.method === 'GET') {
      try {
        const data = fs.existsSync(updatesFile) ? fs.readFileSync(updatesFile, 'utf8') : '[]';
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(data);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'failed to read updates' }));
      }
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const list = JSON.parse(body || '[]');
          if (Array.isArray(list)) {
            fs.writeFileSync(updatesFile, JSON.stringify(list, null, 2), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: true, count: list.length }));
          } else {
            throw new Error('Invalid format');
          }
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid payload' }));
        }
      });
      return;
    }
  }

  if (pathname === '/api/admin/stats') {
    const leads = readLeads();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      visitors: visits.total,
      visitorsToday: visits.today,
      totalLeads: leads.length,
      openLeads: leads.filter(l => l.status === 'open').length
    }));
    return;
  }

  if (pathname === '/api/wa') {
    // Redirect to WhatsApp chat (replace phone number as needed)
    res.writeHead(302, { 'Location': 'https://wa.me/917373997323' });
    res.end();
    return;
  }

  // --- Static File Handler ---
  let safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = 'index.html';
  
  let filePath = path.join(ROOT_DIR, safePath);

  // If path doesn't have an extension, try appending .html (clean URL support)
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 handler
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>The page <code>${pathname}</code> was not found on RR Computers.</p><p><a href="/">Return Home</a></p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

const { exec } = require('child_process');

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  RR Computers | E Sevai Maiyam | Govt Authorized e-Seva & CSC`);
  console.log(`  Running successfully at: http://localhost:${PORT}`);
  console.log(`  Opening browser automatically...`);
  console.log(`=======================================================`);

  // Automatically open browser on start
  setTimeout(() => {
    try {
      if (process.platform === 'win32') {
        exec(`start "" "http://localhost:${PORT}"`);
      } else if (process.platform === 'darwin') {
        exec(`open "http://localhost:${PORT}"`);
      } else {
        exec(`xdg-open "http://localhost:${PORT}"`);
      }
    } catch (e) {}
  }, 400);
});

