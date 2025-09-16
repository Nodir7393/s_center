const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

router.use(authenticateToken);

// Get all payments
router.get('/', async (req, res) => {
  try {
    const { client_id, month } = req.query;
    
    let query = supabase
      .from('payments')
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

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Filter by month if provided
    let filteredData = data;
    if (month) {
      filteredData = data.filter(payment => {
        const paymentDate = new Date(payment.date);
        const paymentMonth = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
        return paymentMonth === month;
      });
    }

    res.json(filteredData);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Create payment
router.post('/', async (req, res) => {
  try {
    const { client_id, amount, description } = req.body;

    if (!client_id || !amount) {
      return res.status(400).json({ error: 'Client ID and amount are required' });
    }

    // Start transaction
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        client_id,
        amount: parseFloat(amount),
        description,
        date: new Date().toISOString(),
        user_id: req.user.id
      }])
      .select()
      .single();

    if (paymentError) {
      return res.status(400).json({ error: paymentError.message });
    }

    // Update client's paid amount
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('paid_amount')
      .eq('id', client_id)
      .eq('user_id', req.user.id)
      .single();

    if (clientError) {
      return res.status(400).json({ error: 'Client not found' });
    }

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        paid_amount: client.paid_amount + parseFloat(amount),
        last_payment: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', client_id)
      .eq('user_id', req.user.id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    // Get payment details first
    const { data: payment, error: getError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (getError || !payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Delete payment
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    // Update client's paid amount
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('paid_amount')
      .eq('id', payment.client_id)
      .single();

    if (!clientError && client) {
      await supabase
        .from('clients')
        .update({
          paid_amount: Math.max(0, client.paid_amount - payment.amount),
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.client_id);
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

module.exports = router;