const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

router.use(authenticateToken);

// Get all monthly profits
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    
    let query = supabase
      .from('monthly_profits')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get profits error:', error);
    res.status(500).json({ error: 'Failed to fetch profits' });
  }
});

// Create monthly profit
router.post('/', async (req, res) => {
  try {
    const { 
      month, 
      total_revenue, 
      total_expenses, 
      total_debts_added, 
      debt_payments = 0, 
      product_profit = 0 
    } = req.body;

    if (!month || total_revenue === undefined || total_expenses === undefined || total_debts_added === undefined) {
      return res.status(400).json({ 
        error: 'Month, total revenue, total expenses and total debts added are required' 
      });
    }

    const net_profit = parseFloat(total_revenue) - parseFloat(total_debts_added) - parseFloat(total_expenses) + parseFloat(debt_payments) + parseFloat(product_profit);

    const { data, error } = await supabase
      .from('monthly_profits')
      .insert([{
        month,
        total_revenue: parseFloat(total_revenue),
        total_expenses: parseFloat(total_expenses),
        total_debts_added: parseFloat(total_debts_added),
        debt_payments: parseFloat(debt_payments),
        product_profit: parseFloat(product_profit),
        net_profit,
        user_id: req.user.id
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create profit error:', error);
    res.status(500).json({ error: 'Failed to create profit record' });
  }
});

// Update monthly profit
router.put('/:id', async (req, res) => {
  try {
    const { 
      month, 
      total_revenue, 
      total_expenses, 
      total_debts_added, 
      debt_payments, 
      product_profit 
    } = req.body;

    const net_profit = parseFloat(total_revenue) - parseFloat(total_debts_added) - parseFloat(total_expenses) + parseFloat(debt_payments || 0) + parseFloat(product_profit || 0);

    const { data, error } = await supabase
      .from('monthly_profits')
      .update({
        month,
        total_revenue: parseFloat(total_revenue),
        total_expenses: parseFloat(total_expenses),
        total_debts_added: parseFloat(total_debts_added),
        debt_payments: parseFloat(debt_payments || 0),
        product_profit: parseFloat(product_profit || 0),
        net_profit,
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
      return res.status(404).json({ error: 'Profit record not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update profit error:', error);
    res.status(500).json({ error: 'Failed to update profit record' });
  }
});

// Delete monthly profit
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('monthly_profits')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Profit record deleted successfully' });
  } catch (error) {
    console.error('Delete profit error:', error);
    res.status(500).json({ error: 'Failed to delete profit record' });
  }
});

module.exports = router;