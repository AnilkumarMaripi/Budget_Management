import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Smart Budget Planner Serverless Backend',
    timestamp: new Date().toISOString()
  });
});

// Authentication Middleware
async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  req.user = user;
  next();
}

// User Profile Endpoint
app.get('/api/user/profile', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ profile: data, user: req.user });
});

// Expenses Endpoints
app.get('/api/expenses', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ expenses: data });
});

app.post('/api/expenses', authenticateUser, async (req, res) => {
  const { title, amount, category, currency } = req.body;
  if (!title || !amount) {
    return res.status(400).json({ error: 'Title and amount are required' });
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        user_id: req.user.id,
        title,
        amount,
        category: category || 'General',
        currency: currency || 'USD'
      }
    ])
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json({ expense: data[0] });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Smart Budget Planner Backend running on port ${PORT}`);
});
