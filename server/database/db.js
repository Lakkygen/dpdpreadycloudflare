import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data.json');

let data = { users: [], scans: [] };

async function load() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    data = JSON.parse(raw);
  } catch {
    data = { users: [], scans: [] };
    await save();
  }
}

async function save() {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

await load();

export default {
  query: async (sql, params = []) => {
    // Simple SQL parser for our queries
    const lower = sql.toLowerCase();
    
    if (lower.includes('select now()')) {
      return { rows: [{ time: new Date().toISOString() }] };
    }
    
    if (lower.includes('count(*) from users')) {
      return { rows: [{ count: String(data.users.length) }] };
    }
    
    if (lower.includes('select * from users where email')) {
      const email = params[0];
      const user = data.users.find(u => u.email === email);
      return { rows: user ? [user] : [] };
    }
    
    if (lower.includes('select * from users where id')) {
      const id = params[0];
      const user = data.users.find(u => u.id === id);
      return { rows: user ? [user] : [] };
    }
    
    if (lower.includes('insert into users')) {
      const user = { id: params[0], email: params[1], plan: 'free', created_at: new Date().toISOString() };
      data.users.push(user);
      await save();
      return { rows: [user] };
    }
    
    if (lower.includes('update users set')) {
      // Simple update parser
      const id = params[params.length - 1];
      const user = data.users.find(u => u.id === id);
      if (user) {
        if (lower.includes('plan =')) user.plan = params[0];
        if (lower.includes('stripe_customer_id')) user.stripe_customer_id = params[0];
        if (lower.includes('stripe_subscription_id')) user.stripe_subscription_id = params[0];
        await save();
      }
      return { rows: [] };
    }
    
    if (lower.includes('select * from scans where user_id')) {
      const userId = params[0];
      let scans = data.scans.filter(s => s.user_id === userId);
      if (lower.includes('order by created_at desc')) {
        scans = scans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      if (lower.includes('limit')) {
        const limit = parseInt(params[params.length - 2]) || 20;
        const offset = parseInt(params[params.length - 1]) || 0;
        scans = scans.slice(offset, offset + limit);
      }
      return { rows: scans };
    }
    
    if (lower.includes('select * from scans where id')) {
      const id = params[0];
      const userId = params[1];
      const scan = data.scans.find(s => s.id === id && s.user_id === userId);
      return { rows: scan ? [scan] : [] };
    }
    
    if (lower.includes('insert into scans')) {
      const scan = {
        id: 'scan-' + Date.now(),
        user_id: params[0],
        url: params[1],
        overall_score: params[2],
        status: 'completed',
        results_json: params[3],
        created_at: new Date().toISOString()
      };
      data.scans.push(scan);
      await save();
      return { rows: [scan] };
    }
    
    return { rows: [] };
  },
  
  end: () => Promise.resolve()
};
