/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `price` (numeric, required)
      - `discount_percentage` (numeric)
      - `rating` (numeric)
      - `stock` (integer, required)
      - `brand` (text)
      - `category` (text)
      - `thumbnail` (text)
      - `images` (text array)
      - `seller_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on products table
    - Add policies for:
      - Anyone can read products
      - Authenticated sellers can create/update their own products
*/

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  discount_percentage numeric CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  brand text,
  category text,
  thumbnail text,
  images text[],
  seller_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated sellers can insert their own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();