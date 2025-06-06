// wishlist.ts
import { supabase } from './supabase';
import { Product } from '../types';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// Get wishlist items for authenticated user
export async function getWishlistItems(userId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      *,
      product:products (*)
    `)
    .eq('user_id', userId) // <-- solo para este usuario
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching wishlist: ${error.message}`);
  }

  return data || [];
}

// Add item to wishlist
export async function addToWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlists')
    .insert({
      product_id: productId,
      user_id: userId // <-- se incluye aquí
    });

  if (error) {
    throw new Error(`Error adding to wishlist: ${error.message}`);
  }
}

// Remove item from wishlist
export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('product_id', productId)
    .eq('user_id', userId); // <-- eliminar sólo la del usuario

  if (error) {
    throw new Error(`Error removing from wishlist: ${error.message}`);
  }
}

// Check if product is in wishlist
export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Error checking wishlist: ${error.message}`);
  }

  return !!data;
}

// Sync localStorage wishlist to database when user logs in
export async function syncWishlistToDatabase(userId: string, localWishlist: string[]): Promise<void> {
  if (localWishlist.length === 0) return;

  const wishlistItems = localWishlist.map(productId => ({
    product_id: productId,
    user_id: userId // <-- necesario aquí también
  }));

  const { error } = await supabase
    .from('wishlists')
    .upsert(wishlistItems, {
      onConflict: 'user_id,product_id',
      ignoreDuplicates: true
    });

  if (error) {
    console.error('Error syncing wishlist to database:', error);
  }
}
