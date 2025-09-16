const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

router.use(authenticateToken);

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, category, purchase_price, sale_price, stock_quantity = 0, min_quantity = 0 } = req.body;

    if (!name || !category || !purchase_price || !sale_price) {
      return res.status(400).json({ error: 'Name, category, purchase price and sale price are required' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        category,
        purchase_price: parseFloat(purchase_price),
        sale_price: parseFloat(sale_price),
        stock_quantity: parseInt(stock_quantity),
        min_quantity: parseInt(min_quantity),
        user_id: req.user.id
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, category, purchase_price, sale_price, stock_quantity, min_quantity } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        category,
        purchase_price: parseFloat(purchase_price),
        sale_price: parseFloat(sale_price),
        stock_quantity: parseInt(stock_quantity),
        min_quantity: parseInt(min_quantity),
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
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Add stock
router.post('/:id/stock', async (req, res) => {
  try {
    const { quantity, purchase_price, description } = req.body;

    if (!quantity || !purchase_price) {
      return res.status(400).json({ error: 'Quantity and purchase price are required' });
    }

    // Get current product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create stock entry
    const { data: stockEntry, error: stockError } = await supabase
      .from('stock_entries')
      .insert([{
        product_id: req.params.id,
        quantity: parseInt(quantity),
        purchase_price: parseFloat(purchase_price),
        total_cost: parseInt(quantity) * parseFloat(purchase_price),
        description,
        date: new Date().toISOString(),
        user_id: req.user.id
      }])
      .select()
      .single();

    if (stockError) {
      return res.status(400).json({ error: stockError.message });
    }

    // Update product stock and purchase price
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock_quantity: product.stock_quantity + parseInt(quantity),
        purchase_price: parseFloat(purchase_price),
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.status(201).json(stockEntry);
  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

// Record sale
router.post('/:id/sale', async (req, res) => {
  try {
    const { quantity, sale_price, description } = req.body;

    if (!quantity || !sale_price) {
      return res.status(400).json({ error: 'Quantity and sale price are required' });
    }

    // Get current product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock_quantity < parseInt(quantity)) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Create sale record
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        product_id: req.params.id,
        quantity: parseInt(quantity),
        sale_price: parseFloat(sale_price),
        total_amount: parseInt(quantity) * parseFloat(sale_price),
        description,
        date: new Date().toISOString(),
        user_id: req.user.id
      }])
      .select()
      .single();

    if (saleError) {
      return res.status(400).json({ error: saleError.message });
    }

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock_quantity: product.stock_quantity - parseInt(quantity),
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.status(201).json(sale);
  } catch (error) {
    console.error('Record sale error:', error);
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

module.exports = router;