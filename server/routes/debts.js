const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

router.use(authenticateToken);

// Get all debt records
router.get('/', async (req, res) => {
  try {
    const { client_id, month, type } = req.query;
    
    let query = supabase
      .from('debt_records')
      .select(`
        *,
        clients (
          name,
          phone
        )
      `)
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });

    if (client_id) {
      query = query.eq('client_id', client_id);
    }

    if (month) {
      query = query.eq('month', month);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get debt records error:', error);
    res.status(500).json({ error: 'Failed to fetch debt records' });
  }
});

// Create debt record
router.post('/', async (req, res) => {
  try {
    const { client_id, amount, description, type = 'additional' } = req.body;

    if (!client_id || !amount) {
      return res.status(400).json({ error: 'Client ID and amount are required' });
    }

    const currentDate = new Date();
    const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Create debt record
    const { data: debtRecord, error: debtError } = await supabase
      .from('debt_records')
      .insert([{
        client_id,
        amount: parseFloat(amount),
        description: description || 'Qo\'shimcha qarz',
        type,
        date: currentDate.toISOString(),
        month,
        user_id: req.user.id
      }])
      .select()
      .single();

    if (debtError) {
      return res.status(400).json({ error: debtError.message });
    }

    // Update client's total debt
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('total_debt')
      .eq('id', client_id)
      .eq('user_id', req.user.id)
      .single();

    if (clientError) {
      return res.status(400).json({ error: 'Client not found' });
    }

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        total_debt: client.total_debt + parseFloat(amount),
        updated_at: new Date().toISOString()
      })
      .eq('id', client_id)
      .eq('user_id', req.user.id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.status(201).json(debtRecord);
  } catch (error) {
    console.error('Create debt record error:', error);
    res.status(500).json({ error: 'Failed to create debt record' });
  }
});

// Delete debt record
router.delete('/:id', async (req, res) => {
  try {
    // Get debt record details first
    const { data: debtRecord, error: getError } = await supabase
      .from('debt_records')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (getError || !debtRecord) {
      return res.status(404).json({ error: 'Debt record not found' });
    }

    // Delete debt record
    const { error: deleteError } = await supabase
      .from('debt_records')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    // Update client's total debt
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('total_debt')
      .eq('id', debtRecord.client_id)
      .single();

    if (!clientError && client) {
      await supabase
        .from('clients')
        .update({
          total_debt: Math.max(0, client.total_debt - debtRecord.amount),
          updated_at: new Date().toISOString()
        })
        .eq('id', debtRecord.client_id);
    }

    res.json({ message: 'Debt record deleted successfully' });
  } catch (error) {
    console.error('Delete debt record error:', error);
    res.status(500).json({ error: 'Failed to delete debt record' });
  }
});

module.exports = router;