import express from 'express';
const app = express();

app.use(express.json());

// API routes
app.post('/api/scans', (req, res) => {
  res.json({ scanId: 'test-123', status: 'completed', overall_score: 85 });
});

app.get('/api/scans/:id', (req, res) => {
  res.json({ scan: { id: req.params.id, overall_score: 85, url: 'https://example.com' } });
});

app.get('/api/scans/:id/status', (req, res) => {
  res.json({ id: req.params.id, status: 'completed', overall_score: 85 });
});

app.get('/api/debug', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

// Static files
app.use(express.static('dist'));
app.get('*', (req, res) => res.sendFile('index.html', { root: 'dist' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
