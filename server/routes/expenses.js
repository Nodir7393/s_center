const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

router.use(authenticateToken);

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create expense
router.post('/', async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;

    if (!category || !amount || !description) {
      return res.status(400).json({ error: 'Category, amount and description are required' });
    }

    const expenseDate = new Date(date || new Date());
    const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        category,
        amount: parseFloat(amount),
        description,
        date: expenseDate.toISOString(),
        month,
        user_id: req.user.id
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;

    const expenseDate = new Date(date);
    const month = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('expenses')
      .update({
        category,
        amount: parseFloat(amount),
        description,
        date: expenseDate.toISOString(),
        month,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;