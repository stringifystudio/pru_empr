import { supabase } from './supabase';
import { Product } from '../types';

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*') // Eliminamos la relación con seller
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }

  return data; // Ya no necesitamos mapear seller
}

export async function createProduct(product: Omit<Product, 'id' | 'seller'>) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('No se pudo obtener el usuario autenticado.');
  }

  console.log('USER:', user);
  console.log('product to insert', { ...product, seller_id: user.id });

  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        ...product,
        seller_id: user.id
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }

  return data;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }

  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
}
