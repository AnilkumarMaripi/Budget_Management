# Smart Budget Planner - Backend API (Supabase Serverless)

A modern serverless API built with Node.js, Express, and Supabase for real-time authentication, user profiles, and expense tracking.

## Features
- **Supabase Authentication**: Integrated JWT verification and session management.
- **Row Level Security (RLS)**: Isolated user data protection directly at the database layer.
- **Expense API**: REST endpoints for retrieving, creating, and categorizing transactions.
- **Multi-Currency Support**: Synchronized with user currency preferences.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd Backend
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   PORT=5000
   ```

3. **Database Schema**:
   Run the SQL statements in `schema.sql` inside your Supabase SQL Editor.

4. **Run Server**:
   ```bash
   npm start
   ```
