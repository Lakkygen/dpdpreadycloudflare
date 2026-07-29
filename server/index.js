import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// ========== JSON DATABASE ==========
const DB_FILE = path.join(process.cwd(), 'data.json');
let db = { users: [], scans: [] };

async function loadDB() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    db = JSON.parse(raw);
  } catch {
    db = { users: [], scans: [] };
    await saveDB();
  }
}

async function saveDB() {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

await loadDB();

// ========== EXPRESS SETUP ==========
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ========== HELPER FUNCTIONS ==========
function getToken(req) {
  const auth = req.headers.authorization;
  return auth ? auth.replace('Bearer ', '') : null;
}

function getUser(req) {
  const token = getToken(req);
  if (!token) return null;
  // Simple token = userId for now
  return db.users.find(u => u.id === token) || null;
}

function requireAuth(req, res, next) {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}

// ========== SCANNER (SIMPLE VERSION) ==========
async function performScan(url) {
  // Simulate scan with realistic data
  await new Promise(r => setTimeout(r, 2000)); // 2 second delay
  
  return {
    overallScore: Math.floor(Math.random() * 30) + 50, // 50-80 score
    confidence: 0.7,
    issues: [
      {
        checkId: 'consent-banner',
        title: 'Consent Banner',
        passed: Math.random() > 0.3,
        severity: 'high',
        description: 'Website ' + (Math.random() > 0.3 ? 'has' : 'lacks') + ' a visible consent banner',
        suggestedFix: 'Add a cookie consent banner with accept/reject options'
      },
      {
        checkId: 'privacy-policy',
        title: 'Privacy Policy',
        passed: Math.random() > 0.2,
        severity: 'medium',
        description: 'Privacy policy page ' + (Math.random() > 0.2 ? 'found' : 'not found'),
        suggestedFix: 'Create a comprehensive privacy policy page'
      },
      {
        checkId: 'data-retention',
        title: 'Data Retention Policy',
        passed: Math.random() > 0.5,
        severity: 'medium',
        description: 'Data retention information ' + (Math.random() > 0.5 ? 'present' : 'missing'),
        suggestedFix: 'Add data retention period disclosures'
      },
      {
        checkId: 'third-party',
        title: 'Third-Party Sharing',
        passed: Math.random() > 0.4,
        severity: 'low',
        description: 'Third-party data sharing ' + (Math.random() > 0.4 ? 'disclosed' : 'not disclosed'),
        suggestedFix: 'List all third-party services that receive user data'
      }
    ],
    summary: 'Scan completed for ' + url
  };
}

// ========== AUTH ROUTES ==========
app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  const existing = db.users.find(u => u.email === email);
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  
  const user = {
    id: 'user-' + Date.now(),
    email,
    name: full_name || email.split('@')[0],
    plan: 'free',
    created_at: new Date().toISOString()
  };
  
  db.users.push(user);
  await saveDB();
  
  res.json({ user, token: user.id, message: 'Account created' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  
  res.json({ user, token: user.id, message: 'Login successful' });
});

app.get('/api/auth/profile', requireAuth, async (req, res) => {
  res.json({
    ...req.user,
    plan: req.user.plan || 'free',
    scanLimit: 10,
    scansUsed: db.scans.filter(s => s.user_id === req.user.id).length
  });
});

// ========== SCAN ROUTES ==========
app.post('/api/scans', requireAuth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  
  const scanResult = await performScan(url);
  
  const scan = {
    id: 'scan-' + Date.now(),
    user_id: req.user.id,
    url,
    overall_score: scanResult.overallScore,
    status: 'completed',
    results_json: JSON.stringify({
      checks: scanResult.issues.map(i => ({
        checkId: i.checkId,
        title: i.title,
        status: i.passed ? 'passed' : 'failed',
        severity: i.severity,
        description: i.description,
        suggestedFix: i.suggestedFix
      })),
      summary: scanResult.summary
    }),
    ai_confidence: scanResult.confidence,
    created_at: new Date().toISOString()
  };
  
  db.scans.push(scan);
  await saveDB();
  
  res.status(201).json({
    scanId: scan.id,
    ...scan
  });
});

app.get('/api/scans', requireAuth, async (req, res) => {
  const userScans = db.scans
    .filter(s => s.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(userScans);
});

app.get('/api/scans/:id', requireAuth, async (req, res) => {
  const scan = db.scans.find(s => s.id === req.params.id && s.user_id === req.user.id);
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  res.json({ scan });
});

app.get('/api/scans/:id/status', requireAuth, async (req, res) => {
  const scan = db.scans.find(s => s.id === req.params.id && s.user_id === req.user.id);
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  res.json({
    id: scan.id,
    status: scan.status,
    overall_score: scan.overall_score
  });
});

// ========== REPORTS (PDF) ==========
app.post('/api/reports', requireAuth, async (req, res) => {
  const { scanId } = req.body;
  const scan = db.scans.find(s => s.id === scanId && s.user_id === req.user.id);
  if (!scan) return res.status(404).json({ error: 'Scan not found' });
  
  res.json({
    reportId: 'report-' + Date.now(),
    status: 'ready',
    downloadUrl: `/api/reports/${scanId}/pdf`
  });
});

app.get('/api/reports/:id/pdf', requireAuth, async (req, res) => {
  const scan = db.scans.find(s => s.id === req.params.id && s.user_id === req.user.id);
  if (!scan) return res.status(404).json({ error: 'Report not found' });
  
  // Simple text-based PDF response
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="dpdp-report-${scan.id}.txt"`);
  res.send(`
DPDP COMPLIANCE REPORT
======================
URL: ${scan.url}
Score: ${scan.overall_score}%
Date: ${scan.created_at}

${JSON.parse(scan.results_json).summary}

Findings:
${JSON.parse(scan.results_json).checks.map(c => `- ${c.title}: ${c.status.toUpperCase()}`).join('\n')}

Generated by DPDPready
  `);
});

// ========== BILLING (STUB) ==========
app.get('/api/billing/status', requireAuth, async (req, res) => {
  res.json({ plan: req.user.plan, hasCustomer: false, hasSubscription: false });
});

app.post('/api/billing/create-checkout-session', requireAuth, async (req, res) => {
  res.status(501).json({ error: 'Payments not configured yet' });
});

// ========== HEALTH & DEBUG ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/test-db', (req, res) => {
  res.json({ ok: true, users: db.users.length, scans: db.scans.length });
});

// ========== STATIC FILES ==========
app.use(express.static('dist'));
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});

// ========== START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[STARTUP] Server on port ${PORT}`);
  console.log(`[STARTUP] Users: ${db.users.length}, Scans: ${db.scans.length}`);
});
