const express = require('express');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Check if Supabase environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Supabase environment variables are missing!');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in server/.env file');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Register
router.post('/register', async (req, res) => {
  try {
    const { telegram, password, name } = req.body;

    if (!telegram || !password || !name) {
      return res.status(400).json({ error: 'Telegram, password and name are required' });
    }

    // Create a valid email from telegram username
    const cleanTelegram = telegram.replace('@', '');
    const email = `${cleanTelegram}@steamcenter.local`;

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password,
      options: {
        data: {
          name: name,
          telegram: telegram
        },
        emailRedirectTo: undefined
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { telegram, password } = req.body;

    if (!telegram || !password) {
      return res.status(400).json({ error: 'Telegram and password are required' });
    }

    // Create a valid email from telegram username
    const cleanTelegram = telegram.replace('@', '');
    const email = `${cleanTelegram}@steamcenter.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session,
      access_token: data.session.access_token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;