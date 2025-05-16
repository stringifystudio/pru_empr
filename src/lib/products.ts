import { supabase } from './supabase';
import { Product } from '../types';

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:seller_id (
        id,
        full_name,
        rating
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }

  return data.map(product => ({
    ...product,
    id: product.id,
    seller: {
      id: product.seller?.id,
      name: product.seller?.full_name || 'Anonymous',
      rating: product.seller?.rating || 4.5
    }
  }));
}

export async function createProduct(product: Omit<Product, 'id' | 'seller'>) {
  // Primero obtenemos el ID del usuario autenticado
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('No se pudo obtener el usuario autenticado.');
  }

  // Luego insertamos el producto con el seller_id correcto
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
