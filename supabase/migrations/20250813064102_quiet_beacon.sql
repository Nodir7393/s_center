/*
  # Steam Center Database Schema

  1. New Tables
    - `clients` - Customer information with debt tracking
    - `expenses` - Monthly expense records by category
    - `payments` - Payment records from clients
    - `debt_records` - Debt addition history
    - `products` - Product inventory management
    - `stock_entries` - Stock addition records
    - `sales` - Sales transaction records
    - `monthly_profits` - Monthly profit calculations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own records

  3. Performance
    - Add indexes for frequently queried columns
    - Optimize for user-based queries
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  -- Drop policies for clients
  DROP POLICY IF EXISTS "Users can manage their own clients" ON clients;
  
  -- Drop policies for expenses
  DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
  
  -- Drop policies for payments
  DROP POLICY IF EXISTS "Users can manage their own payments" ON payments;
  
  -- Drop policies for debt_records
  DROP POLICY IF EXISTS "Users can manage their own debt records" ON debt_records;
  
  -- Drop policies for products
  DROP POLICY IF EXISTS "Users can manage their own products" ON products;
  
  -- Drop policies for stock_entries
  DROP POLICY IF EXISTS "Users can manage their own stock entries" ON stock_entries;
  
  -- Drop policies for sales
  DROP POLICY IF EXISTS "Users can manage their own sales" ON sales;
  
  -- Drop policies for monthly_profits
  DROP POLICY IF EXISTS "Users can manage their own monthly profits" ON monthly_profits;
EXCEPTION
  WHEN undefined_table THEN
    -- Tables don't exist yet, continue
    NULL;
END $$;

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  total_debt decimal(12,2) DEFAULT 0,
  paid_amount decimal(12,2) DEFAULT 0,
  last_payment timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('rent', 'internet', 'electricity', 'tax', 'salary', 'personal')),
  amount decimal(12,2) NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL,
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  amount decimal(12,2) NOT NULL,
  description text,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Debt records table
CREATE TABLE IF NOT EXISTS debt_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  amount decimal(12,2) NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('initial', 'additional')),
  date timestamptz DEFAULT now(),
  month text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  purchase_price decimal(12,2) NOT NULL,
  sale_price decimal(12,2) NOT NULL,
  stock_quantity integer DEFAULT 0,
  min_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stock entries table
CREATE TABLE IF NOT EXISTS stock_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL,
  purchase_price decimal(12,2) NOT NULL,
  total_cost decimal(12,2) NOT NULL,
  description text,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL,
  sale_price decimal(12,2) NOT NULL,
  total_amount decimal(12,2) NOT NULL,
  description text,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Monthly profits table
CREATE TABLE IF NOT EXISTS monthly_profits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL,
  total_revenue decimal(12,2) NOT NULL,
  total_expenses decimal(12,2) NOT NULL,
  total_debts_added decimal(12,2) NOT NULL,
  debt_payments decimal(12,2) DEFAULT 0,
  product_profit decimal(12,2) DEFAULT 0,
  net_profit decimal(12,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint for monthly_profits if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'monthly_profits_user_id_month_key' 
    AND table_name = 'monthly_profits'
  ) THEN
    ALTER TABLE monthly_profits ADD CONSTRAINT monthly_profits_user_id_month_key UNIQUE(user_id, month);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_profits ENABLE ROW LEVEL SECURITY;

-- Create policies for clients
CREATE POLICY "Users can manage their own clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for expenses
CREATE POLICY "Users can manage their own expenses"
  ON expenses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for payments
CREATE POLICY "Users can manage their own payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for debt_records
CREATE POLICY "Users can manage their own debt records"
  ON debt_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for products
CREATE POLICY "Users can manage their own products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for stock_entries
CREATE POLICY "Users can manage their own stock entries"
  ON stock_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for sales
CREATE POLICY "Users can manage their own sales"
  ON sales
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for monthly_profits
CREATE POLICY "Users can manage their own monthly profits"
  ON monthly_profits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id_month ON expenses(user_id, month);
CREATE INDEX IF NOT EXISTS idx_payments_user_id_client_id ON payments(user_id, client_id);
CREATE INDEX IF NOT EXISTS idx_debt_records_user_id_month ON debt_records(user_id, month);
CREATE INDEX IF NOT EXISTS idx_products_user_id_category ON products(user_id, category);
CREATE INDEX IF NOT EXISTS idx_stock_entries_user_id_product_id ON stock_entries(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id_product_id ON sales(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_monthly_profits_user_id_month ON monthly_profits(user_id, month);