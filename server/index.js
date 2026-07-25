import express from 'express';
const app = express();

// This WILL work — proves the server is running
app.get('/api/debug', (req, res) => {
  res.json({ status: 'server is up', time: new Date().toISOString() });
});

// Try importing each module and report failures
const imports = {};
try { imports.db = await import('./database/db.js'); imports.db = 'OK'; } catch (e) { imports.db = e.message; }
try { imports.auth = await import('./routes/auth.js'); imports.auth = 'OK'; } catch (e) { imports.auth = e.message; }
try { imports.scans = await import('./routes/scans.js'); imports.scans = 'OK'; } catch (e) { imports.scans = e.message; }
try { imports.billing = await import('./routes/billing.js'); imports.billing = 'OK'; } catch (e) { imports.billing = e.message; }
try { imports.reports = await import('./routes/reports.js'); imports.reports = 'OK'; } catch (e) { imports.reports = e.message; }
try { imports.users = await import('./routes/users.js'); imports.users = 'OK'; } catch (e) { imports.users = e.message; }
try { imports.health = await import('./routes/health.js'); imports.health = 'OK'; } catch (e) { imports.health = e.message; }
try { imports.errorHandler = await import('./middleware/errorHandler.js'); imports.errorHandler = 'OK'; } catch (e) { imports.errorHandler = e.message; }
try { imports.rateLimit = await import('./middleware/rateLimit.js'); imports.rateLimit = 'OK'; } catch (e) { imports.rateLimit = e.message; }

app.get('/api/imports', (req, res) => {
  res.json({ imports });
});

app.use(express.static('dist'));
app.get('*', (req, res) => res.sendFile('index.html', { root: 'dist' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
